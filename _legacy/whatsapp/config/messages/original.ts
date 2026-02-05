import { Moment } from "moment";

// export const MESSAGES_WH = [
//   {
//     who: "jbexcel",
//     image: "",
//     // video: "",
//     // image: "https://tutosexcel-assets.jbchauvin.fr/messages/Image 1.jpg",
//     video: "https://tutosexcel-assets.jbchauvin.fr/messages/Video 1.mp4",
//     sendOn: (date: Moment) =>
//       date.subtract(2, "days").set({ hour: 9, minute: 0 }),
//     message: (isLive, webinarLink) => `Hellooo tout le monde ! 👋
// Plus de 1400 réponses au formulaire pour la Masterclass ! 😱
//
// Merci à tous d'avoir répondu.
// Ça va beaucoup m'aider à préparer la session 🔥
//
// J'ai vu un truc super intéressant… 👀
// +80% d'entre vous veulent gagner du temps et améliorer leur efficacité au travail
//
// Bonne nouvelle, c’est exactement ce qui sera abordé dimanche !
// Et vous verrez également qu’un bon tableau de bord peut tout changer 🚀
//
// Bonne journée à tous !
// JB
//
// PS : Ne travaille pas sur tes fichiers Excel aujourd’hui !
// Dimanche, je vais te montrer des astuces magiques ✨
// Tu feras en 10 minutes ce qui te prendrait 4 heures maintenant ! 😉`,
//   },
// ];

export const MESSAGES_WH = [
  // Message 1 – J-2 à 9h (+image 1)
  {
    image: "https://tutosexcel-assets.jbchauvin.fr/messages/Image 1.jpg",
    sendOn: (date: Moment) =>
      date.subtract(2, "days").set({ hour: 10, minute: 0 }),
    message: () => `Hellooo tout le monde ! 👋
Plus de 1400 réponses au formulaire pour la Masterclass ! 😱

Merci à tous d'avoir répondu.
Ça va beaucoup m'aider à préparer la session 🔥

J'ai vu un truc super intéressant… 👀
+80% d'entre vous veulent gagner du temps et améliorer leur efficacité au travail

Bonne nouvelle, c’est exactement ce qui sera abordé dimanche !
Et vous verrez également qu’un bon tableau de bord peut tout changer 🚀

Bonne journée à tous !
JB

PS : Ne travaille pas sur tes fichiers Excel aujourd’hui !
Dimanche, je vais te montrer des astuces magiques ✨
Tu feras en 10 minutes ce qui te prendrait 4 heures maintenant ! 😉`,
  },

  // Message 2 – J-2 à 9h
  {
    sendOn: (date: Moment) =>
      date.subtract(2, "days").set({ hour: 9, minute: 0 }),
    message: () => `Tu n’as pas encore répondu au sondage ? C’est ici :
📌 https://forms.gle/Ke97BnZiPNxgkW86A

PS : Réagit avec une 🔥 si tu es chaud pour la Masterclass !!`,
  },

  // Message 3 – J-1 à 18h20
  {
    sendOn: (date: Moment) =>
      date.subtract(1, "day").set({ hour: 18, minute: 20 }),
    message: () => `Heyyy,

J'espère que votre week-end a bien commencé 😉

Je vous met juste ici une petite vidéo YouTube qui pourrait vous intéresser 🙂

Je vous y montre 17 raccourcis ultra intéressant à maîtriser sur Excel 🚀
https://youtu.be/64FQRyVIsEk?si=lmbvUWHKaauvPXm3

Ca peut vous mettre dans l'ambiance pour la Masterclass de demain 🔥`,
  },

  // Message 4 – J-1 à 18h21
  {
    sendOn: (date: Moment) =>
      date.subtract(1, "day").set({ hour: 18, minute: 21 }),
    message: () => `Quelques infos pratiques :

- Ca va durer +/- 1h30 (je resterai pour répondre aux questions)
- Le lien sera renvoyé dans le groupe WhatsApp 5 minutes avant le démarrage donc pas de pression si vous n'avez pas eu de mail de confirmation
- Il est conseillé de rejoindre avec un ordinateur ! (mais pas obligatoire)
- Pas de replay, et les bonus seront à télécharger en fin de session !!`,
  },

  // Message 5 – J-1 à 18h22 (+ Image 2)
  {
    image: "https://tutosexcel-assets.jbchauvin.fr/messages/Image 2.jpg",
    sendOn: (date: Moment) =>
      date.subtract(1, "day").set({ hour: 18, minute: 22 }),
    message:
      () => `Vous vous demandez peut-être : "Est-ce que ça vaut vraiment le coup ? 🤔"
Je vous laisse en juger par vous-même avec le retour que Virginie m’a laissé après la dernière session`,
  },

  // Message 6 – J-J à 09h00 (+ Video 1)
  {
    video: "https://tutosexcel-assets.jbchauvin.fr/messages/Video 1.mp4",
    sendOn: (date: Moment) => date.set({ hour: 9, minute: 0 }),
    message: () => `Hello tout le monde !
Petite vidéo pour vous montrer les bonus exclusifs de la Masterclass de ce soir 😱🔥
Et attention… Ils seront réservés uniquement aux participants présents en direct ! 🎁
C'est ma façon de vous remercier pour votre engagement 🙏
Bonne journée et à ce soir !
JB`,
  },

  // Message 7 – J-J à 09h05
  {
    sendOn: (date: Moment) => date.set({ hour: 9, minute: 5 }),
    message: () => `Rappel des infos pratiques :
- Ca va durer +/- 1h30 (je resterai pour répondre aux questions)
- Le lien sera renvoyé dans le groupe WhatsApp 5 minutes avant le démarrage
- Il est conseillé de rejoindre avec un ordinateur !
- Pas de replay, et les bonus seront à télécharger en fin de session !!

A tout à l'heure 👋
JB`,
  },

  // Message 8 – J-J à 18h45 (+ Video 2)
  {
    video: "https://tutosexcel-assets.jbchauvin.fr/messages/Video 2.mp4",
    sendOn: (date: Moment) => date.subtract(15, "minutes"),
    message: (
      isLive: boolean,
      webinarUrl: string,
      dateWebinar: Moment,
    ) => `Heyyyyyy,
C’est bientôt le grand moment ! 🚀

🚨 Si vous ne retrouvez pas votre lien, vous pouvez ${isLive ? "rejoindre la session à l’aide du lien suivant" : "vous réinscrire juste ici"} :
🔗 ${webinarUrl}

${!isLive ? "Comme ça vous aurez un nouveau lien sur la page de confirmation, ne le perdez pas !!" : ""}
Je vous conseille de rejoindre sur votre ordinateur (mais pas obligé) 😉

Je lance à {{hourWebinar}}h pile 🔥🔥🔥

À tout de suite !
JB`,
  },

  // Message 9 – J-J à 18h50
  {
    sendOn: (date: Moment) => date.subtract(10, "minutes"),
    message: (isLive: boolean, webinarUrl: string) =>
      isLive
        ? `3600 inscrits, je ne peux accueillir que 2000 personnes en live !!
Alors connectez vous rapidement pour sécuriser votre place 💥 
🔗 ${webinarUrl}
A tout de suite !`
        : `3600 inscrits, je ne peux accueillir que 2000 personnes en live !!
Alors connectez vous rapidement pour sécuriser votre place 💥 
🔗 ${webinarUrl}
A tout de suite !`,
  },

  // Message 10 – J-J à 19h (+ Image 3)
  {
    image: "https://tutosexcel-assets.jbchauvin.fr/messages/Image 3.jpg",
    sendOn: (date: Moment) => date,
    message: () => `📊 GOOOOOOOOOOOO ! 🔥`,
  },

  // Message 11 – J-J à 19h24
  {
    who: "flavie",
    sendOn: (date: Moment) => date.add(24, "minutes"),
    message: (isLive: boolean, webinarUrl: string) =>
      !isLive
        ? `JB rentre dans le vif du sujet bientôt !
Nous sommes en live depuis bientôt  30 min 😱
Pour nous rejoindre :
🔗 ${webinarUrl}

A tout de suite de l'autre côté 😉`
        : `JB rentre dans le vif du sujet bientôt !
Nous sommes en live depuis bientôt 30 min 😱
Pour nous rejoindre :
🔗 ${webinarUrl}

A tout de suite de l'autre côté 😉`,
  },

  // Message 12 – J-J à 19h30
  {
    who: "flavie",
    sendOn: (date: Moment) => date.add(30, "minutes"),
    message: () =>
      `Petit message pour tout le monde, si vous notez des bugs ou des écarts entre le son et la vidéo, vous pouvez rafraîchir la page, ça devrait régler le problème ! 🙂`,
  },

  // Message 13 – J-J à 20h00
  {
    sendOn: (date: Moment) => date.add(60, "minutes"),
    message: () => `La première partie est terminée !
On passe à la démonstration des tableaux croisés dynamiques 😍
Et bien sûr les fichiers seront en téléchargement à la fin ✨`,
  },

  // Message 14 – J-J à 20h30
  {
    who: "flavie",
    sendOn: (date: Moment) => date.add(90, "minutes"),
    message: () => `Jean-Baptiste vient de l'annoncer en live 🤩 :
Vous pouvez, jusqu'à ce soir minuit, rejoindre la formation La Maîtrise V2 pour enfin devenir un pro d'Excel en moins de 30 jours seulement !
Voilà le lien d'inscription :
https://tutosurexcel.thrivecart.com/masterclass-la-maitrise-v2/`,
  },

  // Message 15 – J-J à 20h57
  {
    who: "flavie",
    sendOn: (date: Moment) => date.add(60 + 57, "minutes"),
    message:
      () => `On reçoit pas mal de questions sur la possibilité de payer en 5 fois.
Pas de souci ! C’est bien dispo sur ce lien :
https://tutosurexcel.thrivecart.com/masterclass-la-maitrise-v2/`,
  },

  // Message 16 – J-J à 21h20 (+ Image 4)
  {
    who: "flavie",
    image: "https://tutosexcel-assets.jbchauvin.fr/messages/image 4.png",
    sendOn: (date: Moment) => date.add(140, "minutes"),
    message:
      () => `Plusieurs personnes nous ont demandé si elles n’étaient pas trop débutantes pour rejoindre le programme.

Bonne nouvelle : la formation est conçue pour tous les niveaux, du grand débutant jusqu’à l’intermédiaire ++ 😀
On commence par les bases, vraiment le niveau 0, puis on progresse étape par étape, sans jamais vous laisser derrière 😉

C’est d’ailleurs ce que les anciens participants ont le plus apprécié !`,
  },

  // Message 17 – J-J à 21h50 (+ Video 3)
  {
    video: "https://tutosexcel-assets.jbchauvin.fr/messages/Video 3.mp4",
    sendOn: (date: Moment) => date.add(60 * 3 - 10, "minutes"),
    message: () => `Merci à tous pour votre présence 🙏`,
  },

  // Message 18 – J-J à 21h55
  {
    sendOn: (date: Moment) => date.add(60 * 3 - 5, "minutes"),
    message: () => `Merci à tous pour votre présence 🙏
C’était une soirée de folie 🔥
Plus de 1600 participants au total, et pratiquement 03h00 de Live 😍

Vous pouvez donc bénéficier de l’offre exceptionnelle via le lien suivant :
https://tutosurexcel.thrivecart.com/masterclass-la-maitrise-v2/
✅ Paiement possible en 3 ou 5 fois

✅ Tous les bonus inclus si vous rejoignez avant minuit :
Accès au groupe privé pour échanger et poser vos questions
1 session en direct par mois pour approfondir vos dashboards
Formation TABLEAU DE BORD EXCEL pour automatiser encore plus vos reportings
Templates de tableaux de bord prêts à l'emploi
Certificat de Compétences pour booster votre CV et LinkedIn
Accès à vie !

Bonne soirée,
JB`,
  },

  // Message 19 – J-J à 21h56
  {
    sendOn: (date: Moment) => date.add(60 * 3 - 4, "minutes"),
    message: () => `Toutes les infos sont dans le replay
Je vous l’envoie dans les prochaines minutes, le temps de traiter la vidéo :D

Vous avez jusqu’à ce soir minuit pour saisir l’opportunité ⌛`,
  },

  // Message 20 – J-J à 22h00
  {
    sendOn: (date: Moment) => date.add(60 * 3, "minutes"),
    message: () => `Re tout le monde !
Comme promis, voilà le lien du replay :
https://power.tutosurexcel.com/masterclass-ia-replay
Encore merci pour votre présence, c’était vraiment top !`,
  },

  // Message 21 – J-J à 22h01 (+ Image 5)
  {
    image: "https://tutosexcel-assets.jbchauvin.fr/messages/Image 5.jpg",
    sendOn: (date: Moment) => date.add(60 * 3 + 1, "minutes"),
    message: () =>
      `Et comme promis je vous partage dès demain dans ce groupe WhatsApp la vidéo pour refaire le graphique en jauge`,
  },

  // Message 22 – J-J à 22h30 (+ Image 6)
  {
    who: "flavie",
    image: "https://tutosexcel-assets.jbchauvin.fr/messages/Image 6.jpg",
    sendOn: (date: Moment) => date.add(60 * 3 + 30, "minutes"),
    message: () => `👉 Voici les avis de Jerry, Nelly et Laure :

Ils étaient comme vous, ils se sentaient dépassés par les formules et les tableaux sur Excel.
Aujourd’hui ?
Ils automatisent leurs tâches, analysent leurs données en un clin d’œil et gagnent un temps fou ! 🚀
💡Si eux l’ont fait, pourquoi pas vous ?
➡ Profitez de votre réduction de 50% avant minuit en cliquant ici dès maintenant : https://tutosurexcel.thrivecart.com/masterclass-la-maitrise-v2/`,
  },

  // Message 23 – J-J à 23h00
  {
    who: "flavie",
    sendOn: (date: Moment) => date.set({ hour: 23, minute: 0 }),
    message: () => `H-1 ⏰
Il vous reste seulement quelques minutes pour profiter de cette offre exceptionnelle avant que le tarif ne double à minuit
Ne laissez pas passer cette opportunité unique de booster vos compétences Excel !
👉 Cliquez vite ici pour nous rejoindre : https://tutosurexcel.thrivecart.com/masterclass-la-maitrise-v2/`,
  },

  // Message 23.1 – J-J à 23h00
  {
    who: "flavie",
    sendOn: (date: Moment) => date.set({ hour: 23, minute: 0 }),
    message:
      () => `Bravo à tous ceux qui ont pris leur avenir en main en rejoignant la formation ce soir 😍🔥

Sylvain, Inès, Blandine, wahib, wahib, Karin, Fèmi, ISABELLE, Céline, Nadia, Céline, valérie, Lionel, Kébira, Chantal, Rajka, Hélène, Vanessa, Marie, Catherine, Carole, Kevin, Estelle, Sandra, BELA, Fèmi, BRENDA VANESSA, Maryse, Noria, Honoré, Céline, Mahamadou, Salwa, Lucie, Bruno, Philippe, Jean, Érick, Ricardo, marc, ryan, Aurélien, Filipe, Rachida, Kaoutar, Severine, Laurence, BEATRICE, Bindou, beatrice, Philippe, gilles, FREDERIC, Anabelle…

(Oui j’ai utilisé une fonction Excel pour combiner les prénoms 😛)`,
  },

  // Message 24 – J-J à 23h01
  {
    who: "flavie",
    sendOn: (date: Moment) => date.set({ hour: 23, minute: 1 }),
    message: () => `Toutes ces personnes-là pourront :
 Devenir incontournable dans leur entreprise en 2025
 Gagner des heures de travail chaque semaine
 Éviter les erreurs coûteuses et travailler avec efficacité

 Profitez de cette remise spéciale avant qu’il ne soit trop tard :
https://tutosurexcel.thrivecart.com/masterclass-la-maitrise-v2/`,
  },

  // Message 25 – J-J à 23h30
  {
    who: "flavie",
    sendOn: (date: Moment) => date.set({ hour: 23, minute: 30 }),
    message: () => `🔴 C’est maintenant ou jamais !
30 minutes.
C’est le temps qu’il vous reste pour gagner un temps fou et éliminer le stress face aux fichiers complexes sur Excel.
Rejoignez dès maintenant la formation et profitez de votre remise spéciale de 300€ + vos 6 bonus offerts :
https://tutosurexcel.thrivecart.com/masterclass-la-maitrise-v2/`,
  },

  // Message 26 – J+1 à 19h
  {
    sendOn: (date: Moment) => date.add(1, "day").set({ hour: 19, minute: 0 }),
    message: () => `Helloooo tout le monde
J'espère que vous allez bien !

Comme promis, voilà la vidéo tuto pour refaire le fameux graphique avec la jauge 😀
https://power.tutosurexcel.com/masterclass-ia-loom`,
  },

  // Message 27 – J+1 à 19h01
  {
    sendOn: (date: Moment) => date.add(1, "day").set({ hour: 19, minute: 1 }),
    message:
      () => `On a eu pas mal de messages concernant des problèmes de connexion hier soir...
Vraiment désolés, malheureusement c'était indépendant de ma volonté 😬

Du coup, j’ai décidé de laisser le replay de la Masterclass et de prolonger l'offre quelques jours de plus...
Comme ça, vous avez le temps de prendre une décision éclairée

En plus, ça vous permet de voir avec votre employeur s' ils peuvent vous la rembourser (ça se fait très souvent pour info, et ça coûte rien de demander 😉)

🔗 Pour rejoindre la formation, c’est par ici :
https://tutosurexcel.thrivecart.com/masterclass-la-maitrise-v2/

Bonne soirée,
JB
PS : si jamais vous avez besoin d'infos supplémentaires, n'hésitez pas à demander à moi ou à Flavie !`,
  },

  // Message 28 – J+2 à 19h
  {
    sendOn: (date: Moment) => date.add(2, "days").set({ hour: 19, minute: 0 }),
    message:
      () => `Bravo à tous ceux qui ont pris leur avenir en main en rejoignant la formation depuis dimanche soir 🔥
Pour ceux qui ne sont pas encore décidés, je vous remet juste ici le lien du replay, dans lequel vous retrouvez toutes les infos :
https://tutosurexcel.thrivecart.com/masterclass-la-maitrise-v2/`,
  },

  // Message 29 – J+2 à 19h
  {
    sendOn: (date: Moment) => date.add(2, "days").set({ hour: 19, minute: 0 }),
    message: () => `PS : Il est dispo jusqu'à vendredi soir !
L’accès à vie est réservé aux personnes rejoignant le Campus Excel ❤️`,
  },

  // Message 30 – J+3 à 19h
  {
    sendOn: (date: Moment) => date.add(3, "days").set({ hour: 19, minute: 0 }),
    message: () => `Hello tout le monde !
J’espère que vous commencez à gagner en efficacité !
Avez-vous déjà mis en pratique certaines astuces de la Masterclass ?

⏳ Rappel : Le replay est dispo jusqu’à vendredi soir !

Beaucoup se font rembourser par leur employeurs, n'hésitez pas à demander !
ça ne coûte rien, ça montre que vous êtes dans une démarche de progression

Bref c'est que du + !!

Je vous remet le lien juste ici :
https://tutosurexcel.thrivecart.com/masterclass-la-maitrise-v2/

Et si vous avez besoin d’informations complémentaires, vous pouvez nous envoyer un mail à contact@tutosurexcel.com 🙂`,
  },

  // Message 31 – J+4 à 08h05
  {
    sendOn: (date: Moment) => date.add(4, "days").set({ hour: 8, minute: 5 }),
    message: () => `Heyyyyyy tout le monde

Beaucoup m'ont dit ne pas avoir accès à la RECHERCHEX que j'ai expliqué pendant la session en direct…

Dans ces cas-là, je vous conseille de remplacer la RECHERCHEV par la combinaison de fonctions INDEX et EQUIV 💪.

Est-ce qu'une vidéo explicative d'INDEX + EQUIV vous intéresse ? 👀`,
  },

  // Message 32 – J+4 à 08h06
  {
    sendOn: (date: Moment) => date.add(4, "days").set({ hour: 8, minute: 6 }),
    message: () => `📊 Sondage rapide : INDEX EQUIV ? 👀
✅ Oui
❌ Non`,
  },

  // Message 33 – J+4 à 19h30
  {
    sendOn: (date: Moment) => date.add(4, "days").set({ hour: 19, minute: 30 }),
    message: () => `Okkkk vous m'avez l'air chaud
Alors voilà la vidéo qui vous explique comment faire 🔥
https://power.tutosurexcel.com/masterclass-ia-index-equiv
Bonne soirée !!
JB`,
  },

  // Message 34 – J+5 à 12h
  {
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 12, minute: 0 }),
    message: () => `Hello tout le monde,

J'espère que vous passez un bon vendredi
Pour rappel le replay de la Masterclass expire ce soir !

Ce qui veut aussi dire qu'il ne vous reste que quelques heures pour rejoindre la formation complète et enfin impressionner tout le monde au bureau 💪

Si vous avez aimé ce que je vous ai partagé, que ça soit en direct ou via les bonus alors aucun doute sur le fait que la formation vous plaira ❤

Je vous remet le lien juste ici : https://tutosurexcel.thrivecart.com/masterclass-la-maitrise-v2/

Bonne aprem
JB`,
  },

  // Message 35 – J+5 à 19h
  {
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 19, minute: 0 }),
    message:
      () => `J'ai aussi eu beaucoup de messages me demandant si la formation est adaptée aux débutants.
La réponse est un grand OUI !

Au début, on reprend les bases et on évolue progressivement vers un niveau avancé, tout est pensé pour ne perdre personne en route.`,
  },

  // Message 36 – J+5 à 19h01 (+ Images 7-8-9)
  {
    images: [
      "https://tutosexcel-assets.jbchauvin.fr/messages/Image 7.jpg",
      "https://tutosexcel-assets.jbchauvin.fr/messages/Image 8.jpg",
      "https://tutosexcel-assets.jbchauvin.fr/messages/Image 9.jpg",
    ],
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 19, minute: 1 }),
    message: () =>
      `C'est d'ailleurs ce que la plupart des retours que j'ai reçu cette semaine mentionnent 😍`,
  },

  // Message 37 – J+5 à 19h01
  {
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 19, minute: 1 }),
    message: () => `Il est encore temps de les rejoindre 😉
https://tutosurexcel.thrivecart.com/masterclass-la-maitrise-v2/`,
  },

  // Message 38 – J+5 à 19h05
  {
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 19, minute: 5 }),
    message:
      () => `Et pour rappel, il y a la garantie satisfait ou remboursé pendant 30 columnist...
Un simple mail suffit

Donc vous ne prenez aucun risque à essayer, voir si c'est fait pour vous ou non
Et prendre la décision avec toutes les cartes en main !!

Je vous remet le lien une dernière fois
https://tutosurexcel.thrivecart.com/masterclass-la-maitrise-v2/

Si vous avez 15-20 minutes de dispo ce week-end, vous aurez déjà l'occasion de vous former 💪

✨ Le meilleur investissement que vous puissiez faire est sur vous même ✨`,
  },

  // Message 39 – J+5 à 20h00 (+ Image 10)
  {
    image: "https://tutosexcel-assets.jbchauvin.fr/messages/Image 10.jpg",
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 20, minute: 0 }),
    message: () =>
      `Allez je vous remet un avis Google, parce qu'il m'a vraiment fait plaisir`,
  },

  // Message 40 – J+5 à 20h01
  {
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 20, minute: 1 }),
    message: () =>
      `Pour voir à quel point la formation peut changer votre quotidien 👉 https://tutosurexcel.thrivecart.com/masterclass-la-maitrise-v2/`,
  },

  // Message 41 – J+5 à 20h30 (+ Image 11)
  {
    who: "flavie",
    image: "https://tutosexcel-assets.jbchauvin.fr/messages/Image 11.jpg",
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 20, minute: 30 }),
    message: () =>
      `L’accès à vie et à toutes les mises à jour, c’est vraiment un bonus super apprécié ! 🔥🎁✅`,
  },

  // Message 42 – J+7 à 19h00
  {
    sendOn: (date: Moment) => date.add(7, "days").set({ hour: 19, minute: 0 }),
    message: (isLive, webinarLink) => `Hello tout le monde !

J'espère que vous allez bien 😀

Je suis toujours en quête d'amélioration, alors j'ai mis en place un petit formulaire pour avoir vos retours d'expérience sur la Masterclass Excel.

ça prend moins de 2 minutes à remplir, et moi ça m'aide à vous proposer des contenus toujours plus qualitatifs 🚀

Pour vous remercier de prendre le temps de le remplir, à la fin du formulaire vous avez le dossier récap de la Masterclass avec tous les fichiers bonus

https://forms.gle/Bk8hnnm3ahCrqL2d6

Bonne semaine !
JB`,
  },
];
