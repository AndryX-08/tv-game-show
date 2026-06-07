# TV Game Night 📺

Web app per organizzare una serata di giochi TV in locale oppure online, con login Firebase, classifica utenti e sincronizzazione delle partite multiplayer.

## Giochi inclusi 🎱

- Avanti un Altro
- L'Eredita
- Intesa Vincente
- La Ruota
- Reazione a Catena
- Sarabanda
- Indovina Chi
- Taboo con pagina giocatore separata

## Funzionalità 🔗

- Login con Google o accesso anonimo tramite Firebase Auth.
- Profili giocatore con nome, cognome, nickname e punteggio totale.
- Punteggi salvati su Firestore.
- Classifica online tra utenti registrati/anonimi.
- Modalita locale oppure online per i giochi multiplayer.
- Inviti online tra utenti registrati.
- Sessioni multiplayer sincronizzate tramite Firestore per Ruota, Eredita, Reazione a Catena, Sarabanda e Indovina Chi.
- Sarabanda con playlist audio configurabile e punteggio automatico.
- Indovina Chi con personaggi famosi, indizi progressivi e punti automatici.
- Taboo con `host.html` e `play.html` per usare un secondo dispositivo come controller/schermo giocatore.
- Layout responsive per desktop e mobile.

## Setup Firebase

Il progetto usa:

- Firebase Authentication
- Cloud Firestore
- Realtime Database
- Cloud Messaging

Nel codice e gia presente la configurazione Firebase del progetto. Per usare una tua istanza Firebase, sostituisci `firebaseConfig` in:

- `script.js`
- `host.html`
- `play.html`
- `service-worker.js`

## Firestore

Collezioni usate:

- `users/{uid}`
- `leaderboard/{uid}`
- `scoreEvents/{eventId}`
- `questionBanks/{bankId}`
- `gameSessions/{sessionId}`
- `users/{uid}/gameInvites/{inviteId}`
- `users/{uid}/fcmTokens/{tokenId}`

Le regole di sicurezza sono in `firestore.rules` e vengono collegate dal file
`firebase.json`. Per pubblicarle:

```sh
firebase deploy --only firestore:rules
```

Ogni utente puo modificare solo il proprio profilo, la propria classifica e i
propri token. Le sessioni online sono accessibili solo agli UID inclusi in
`participantUids`; gli inviti verificano mittente e destinatario. Le banche
domande non sono scrivibili dal browser.

## Notifiche inviti

Le notifiche PWA usano Firebase Cloud Messaging:

1. genera una Web Push certificate key in Firebase Console;
2. inserisci la chiave pubblica in `FCM_VAPID_KEY` dentro `script.js`;
3. installa e deploya le Cloud Functions da `functions/`.

La funzione `notifyGameInvite` invia una notifica quando viene creato un documento `users/{uid}/gameInvites/{inviteId}`.

## Letture e scritture Firebase

La parte piu costosa era `updatePresenceState()`: prima veniva chiamata a ogni `goTo(...)`, scriveva `currentGame/currentScreen` in Realtime Database e anche nel documento Firestore `users/{uid}`. Ora la presenza resta limitata a online/offline e lobby, senza tracciare il gioco corrente.

Per caricare o aggiornare le domande usa Firebase Admin SDK, la console
Firestore oppure uno script amministrativo autenticato. Le regole pubbliche
bloccano intenzionalmente `seedQuestionBanksToFirestore()` dal browser.

Questo crea:

```txt
questionBanks/aua
questionBanks/eredita
questionBanks/ruota
questionBanks/catena
questionBanks/sarabanda
questionBanks/guesswho
```

Per Sarabanda puoi aggiungere file audio nella cartella:

```txt
Sarabanda/
```

La playlist placeholder nel codice usa:

```txt
Sarabanda/brano1.mp3
Sarabanda/brano2.mp3
Sarabanda/brano3.mp3
Sarabanda/brano4.mp3
Sarabanda/brano5.mp3
```

## Realtime Database

Realtime Database viene usato soprattutto per Taboo.

Percorsi usati:

```txt
currentGameState
tabooScoreEvents
```

## Come avviare ▶️

Essendo un progetto statico, puoi aprire direttamente `index.html` nel browser oppure pubblicarlo con GitHub Pages / Firebase Hosting / Netlify.

Per testare Taboo:

1. Apri `index.html`.
2. Seleziona Taboo e scegli il giocatore.
3. Apri `host.html` sul dispositivo host.
4. Apri `play.html` sul dispositivo giocatore.

## Note sulla modalita online

Per giocare online:

- tutti i giocatori devono essere registrati o anonimi Firebase;
- ogni giocatore deve essere stato aggiunto alla configurazione;
- l'app del giocatore invitato deve essere aperta e loggata;
- gli inviti vengono letti da `users/{uid}/gameInvites`;
- lo stato live dei giochi multiplayer viene letto da `gameSessions`.

Le sessioni e gli inviti vengono eliminati automaticamente a fine partita quando possibile.
