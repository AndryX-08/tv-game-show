const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const adminOptions = serviceAccountJson
  ? {
      credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    }
  : undefined;

admin.initializeApp(adminOptions);

const GAME_LABELS = {
  ruota: 'la Ruota',
  eredita: "l'Eredita",
  intesa: "l'Intesa Vincente",
  catena: 'Reazione a Catena',
  sarabanda: 'Sarabanda',
  guesswho: 'Indovina Chi',
  higherlower: 'Higher or Lower',
  affarituoi: 'Affari Tuoi',
  movieguess: 'Indovina il Film',
  ghigliottina: 'la Ghigliottina'
};

const ANONYMOUS_MAX_AGE_MS = 3 * 60 * 60 * 1000;

async function deleteQueryDocuments(query) {
  const snapshot = await query.get();
  await Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
}

async function deleteAnonymousData(uid) {
  const firestore = admin.firestore();
  const userRef = firestore.collection('users').doc(uid);

  await deleteQueryDocuments(userRef.collection('gameInvites'));
  await deleteQueryDocuments(userRef.collection('fcmTokens'));
  await deleteQueryDocuments(
    firestore.collectionGroup('gameInvites').where('fromUid', '==', uid)
  );
  await deleteQueryDocuments(firestore.collection('scoreEvents').where('uid', '==', uid));

  const sessions = await firestore
    .collection('gameSessions')
    .where('participantUids', 'array-contains', uid)
    .get();
  await Promise.all(sessions.docs.map(doc => {
    const data = doc.data() || {};
    if (data.createdBy === uid) return doc.ref.delete();
    return doc.ref.update({
      participantUids: admin.firestore.FieldValue.arrayRemove(uid)
    });
  }));

  await Promise.all([
    userRef.delete(),
    firestore.collection('leaderboard').doc(uid).delete(),
    admin.database().ref(`status/${uid}`).remove()
  ]);
}

async function cleanupExpiredAnonymousUsers() {
  const cutoff = Date.now() - ANONYMOUS_MAX_AGE_MS;
  let pageToken;
  let scanned = 0;
  let deleted = 0;

  do {
    const page = await admin.auth().listUsers(1000, pageToken);
    for (const user of page.users) {
      scanned += 1;
      if (!user.isAnonymous || !user.metadata.creationTime) continue;
      if (new Date(user.metadata.creationTime).getTime() > cutoff) continue;

      // Auth deletion happens only after all related data was removed successfully.
      await deleteAnonymousData(user.uid);
      await admin.auth().deleteUser(user.uid);
      deleted += 1;
    }
    pageToken = page.pageToken;
  } while (pageToken);

  console.log(`Anonymous cleanup completed: scanned=${scanned}, deleted=${deleted}`);
}

module.exports.cleanupExpiredAnonymousUsers = cleanupExpiredAnonymousUsers;

exports.notifyGameInvite = functions.firestore
  .document('users/{uid}/gameInvites/{inviteId}')
  .onCreate(async (snapshot, context) => {
    const invite = snapshot.data() || {};
    if (invite.status && invite.status !== 'pending') return null;

    const uid = context.params.uid;
    const inviteId = context.params.inviteId;
    const tokensSnap = await admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('fcmTokens')
      .get();

    const tokenDocs = tokensSnap.docs
      .map(doc => ({ id: doc.id, token: doc.data().token }))
      .filter(item => item.token);

    if (!tokenDocs.length) return null;

    const gameLabel = GAME_LABELS[invite.game] || invite.game || 'un gioco';
    const title = 'Nuovo invito';
    const body = `Da ${invite.fromName || 'un giocatore'} - ${gameLabel}`;
    const message = {
      tokens: tokenDocs.map(item => item.token),
      data: {
        type: 'gameInvite',
        title,
        body,
        inviteId,
        game: String(invite.game || ''),
        fromUid: String(invite.fromUid || ''),
        url: `/?inviteId=${inviteId}`
      },
      webpush: {
        fcmOptions: {
          link: `/?inviteId=${inviteId}`
        }
      }
    };

    const result = await admin.messaging().sendEachForMulticast(message);
    const cleanup = [];
    result.responses.forEach((response, index) => {
      if (response.success) return;
      const code = response.error && response.error.code;
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        cleanup.push(tokensSnap.docs.find(doc => doc.id === tokenDocs[index].id).ref.delete());
      }
    });

    await Promise.all(cleanup);
    return null;
  });
