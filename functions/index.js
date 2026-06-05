const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');

admin.initializeApp();

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
