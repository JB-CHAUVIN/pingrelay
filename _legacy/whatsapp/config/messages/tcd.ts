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
// Bonne nouvelle, c'est exactement ce qui sera abordé dimanche !
// Et vous verrez également qu'un bon tableau de bord peut tout changer 🚀
//
// Bonne journée à tous !
// JB
//
// PS : Ne travaille pas sur tes fichiers Excel aujourd'hui !
// Dimanche, je vais te montrer des astuces magiques ✨
// Tu feras en 10 minutes ce qui te prendrait 4 heures maintenant ! 😉`,
//   },
// ];

export const MESSAGES_WH = [
  // NEW MESSAGE – J-3 à 18h
  {
    sendOn: (date: Moment) => date.subtract(3, "days").set({ hour: 18, minute: 0 }),
    message: () => `Hellooooo tout le monde\nJ'espère que vous allez bien !! \nEt bienvenue sur le groupe WhatsApp de la Masterclass 🔥\nVous l'aurez compris, le thème sera les tableaux croisés dynamiques ! \nVous avez été nombreux à demander cette session sur cet outil ultra puissant d'Excel, alors j'ai préparé quelque chose d'exceptionnel... Grâce aux TCD, vous pourrez:\n✅ Remplacer des dizaines de formules complexes\n✅ Analyser des milliers de lignes en quelques secondes\n✅ Créer des KPIs pertinents que vos managers vont adorer\n\nHâte de vous retrouver dimanche soir (19h00) 😉`,
  },

  // Message 1 – J-2 à 9h (+image 1) JB
  {
    image: "https://tutosexcel-assets.jbchauvin.fr/tcd/Image 1.jpg",
    sendOn: (date: Moment) => date.subtract(2, "days").set({ hour: 9, minute: 0 }),
    message: () => `Hellooo tout le monde  ! 👋\nPlus de 1400 réponses au formulaire pour la Masterclass ! 😱\n\nMerci à tous d'avoir répondu. \nÇa va beaucoup m'aider à préparer la session 🔥\n\nPour info, plus de 95% d'entre vous sont « Débutants » ou « Intermédiaires » sur la maîtrise des TCD !\n\nPas d'inquiétude, on va reprendre les bases tout en explorant les fonctionnalités qui font des TCD un outil si puissant ! \n\nBonne journée,\nJB\n\nPS : Ne travaille pas sur tes fichiers Excel aujourd'hui !\nDimanche, je vais te montrer des astuces magiques ✨\nTu feras en 10 minutes ce qui te prendrait 4 heures maintenant ! 😉`,
  },

  // Message 2 – J-2 à 9h JB
  {
    sendOn: (date: Moment) => date.subtract(2, "days").set({ hour: 9, minute: 0 }),
    message: () => `Pour ceux qui n'ont pas reçu le lien par mail, le voici, ça prend moins de 2 minutes à remplir :\nhttps://forms.gle/cpUEoSyaQKhGK7XZ7\n\nD'ailleurs, pour ceux qui ne retrouvent pas mes mails, pas d'inquiétude, vous aurez toutes les infos importantes dans ce groupe WhatsApp !!\n\nPS : Réagit avec une 🔥 si tu es chaud pour la Masterclass !!`,
  },

  // NEW MESSAGE J-1 à 9h10 (+ Image 2)
  {
    image: "https://tutosexcel-assets.jbchauvin.fr/tcd/image 2.jpg",
    sendOn: (date: Moment) => date.subtract(1, "day").set({ hour: 9, minute: 10 }),
    message: () => `Hello tout le monde !\n\nPour info, comme pour toutes mes Masterclass, vous aurez droit à pleins de bonus à la fin de la session 😍\n\nAu programme :\n🟩 Template de tableau de bord prêt à l'emploi\n🟩 Le guide qui reprendra toutes les explications de la Masterclass \n\nCes bonus seront réservés uniquement aux participants présents en direct ! 🎁\nC'est ma façon de vous remercier pour votre engagement 🙏\n\nBonne journée !\n\nPS : demain soir, vous aurez droit à un tout nouveau tableau de bord, qui sera le résultat de la démonstration de la puissance des tableaux croisés dynamiques`,
  },

  // Message 3 – J-1 à 18h20 JB
  {
    sendOn: (date: Moment) => date.subtract(1, "day").set({ hour: 18, minute: 20 }),
    message: () => `Heyyy,\n\nJ'espère que votre week-end a bien commencé 😉\n\nSi vous avez envie de vous mettre en forme pour la Masterclass de demain, vous pouvez visionner la vidéo YouTube que j'ai posté il y a un petit moment sur la différence entre la RECHERCHEV et la RECHERCHEX 😉\nhttps://www.youtube.com/watch?v=GsCRd_pqOKE\n\nC'est pas le sujet de la Masterclass, mais c'est toujours sympa à maîtriser 💪\n\nUn petit commentaire me fait toujours plaisir si la vidéo vous plait :) \n\nA demain ! \nJB`,
  },

  // Message 4 – J-1 à 18h21 JB
  {
    sendOn: (date: Moment) => date.subtract(1, "day").set({ hour: 18, minute: 21 }),
    message: () => `Quelques infos pratiques : \n\n- Ca va durer +/- 1h30 (je resterai pour répondre aux questions)\n- Le lien sera renvoyé dans le groupe WhatsApp 5 minutes avant le démarrage donc pas de pression si vous n'avez pas eu de mail de confirmation\n- Il est conseillé de rejoindre avec un ordinateur ! (mais pas obligatoire) \n- Pas de replay, et les bonus seront à télécharger en fin de session !!`,
  },

  // Message 5 – J-1 à 18h22 (+ Images 3 & 4) JB
  {
    images: [
      "https://tutosexcel-assets.jbchauvin.fr/tcd/image 3.jpg",
      "https://tutosexcel-assets.jbchauvin.fr/tcd/image 4.jpg",
    ],
    sendOn: (date: Moment) => date.subtract(1, "day").set({ hour: 18, minute: 22 }),
    message: () => `Vous vous demandez peut-être : "Est-ce que ça vaut vraiment le coup de se connecter ? 🤔"\nJe vous laisse en juger par vous-même avec les retour que Virginie et Estelle m'ont laissé après la dernière session sur les TCD 👆`,
  },

  // Message 6 – J-J à 09h00 (+ Video 1) JB
  {
    video: "https://tutosexcel-assets.jbchauvin.fr/tcd/Video 1.mp4",
    sendOn: (date: Moment) => date.set({ hour: 9, minute: 0 }),
    message: () => `Hello tout le monde !\n\nIl y a 4 ans, je postais par hasard un tuto Excel sur TikTok…\nRésultat ?\nPrès de 10 000 vues, des centaines de messages… et une certitude : je devais continuer.\n\nSi vous vous demandez comment tout ça m'a amené à vous faire un cours Excel ce soir, j'en parle justement dans une interview chez Forbes 👇\nhttps://www.forbes.fr/brandvoice/campus-excel-maitriser-excel-sans-effort-en-moins-de-30-jours-seulement/\n\n🎥 J'y raconte toute l'histoire de Tuto sur Excel : les débuts, les galères, les réussites… et la naissance du Campus Excel !\n\nÀ tout à l'heure pour la Masterclass sur les TCD ! 💪\nJB`,
  },

  // Message 7 – J-J à 17h00 (+video 1) JB
  {
    video: "https://tutosexcel-assets.jbchauvin.fr/tcd/Video 1.mp4",
    sendOn: (date: Moment) => date.set({ hour: 17, minute: 0 }),
    message: () => `Heyyyyyy,\nCa commence dans moins de 2 heures, j'espère que vous êtes chauuuud`,
  },

  // NEW MESSAGE J-J à 17h05
  {
    sendOn: (date: Moment) => date.set({ hour: 17, minute: 5 }),
    message: () => `On me pose souvent cette question : "Mais à quoi ça sert VRAIMENT un tableau croisé dynamique ?" 🤔\nVoici un exemple concret :\nImaginez que vous avez une liste de 10 000 ventes...\nVous devez analyser :\n•\tLes produits les plus vendus par région\n•\tLe CA mensuel par commercial\n•\tL'évolution des ventes sur 3 ans\n\nSans TCD : 3-4 heures de travail minimum\nAvec TCD : 5 minutes chrono ⏱\n\nCe soir, je vous montre comment faire. \nMême si vous n'avez JAMAIS créé de tableau croisé dynamique avant ! 💪`,
  },

  // Message 8 – J-J à 18h45 JB (conditionnel, vidéo supprimée)
  {
    sendOn: (date: Moment) => date.set({ hour: 18, minute: 45 }),
    message: (isLive: boolean, webinarUrl: string) =>
      isLive
        ? `Heyyyyyy,\nC'est bientôt le grand moment ! 🚀\n🚨 Si vous ne retrouvez pas votre lien, vous pouvez rejoindre la session à l'aide du lien suivant :\n🔗 ${webinarUrl}\nJe vous conseille de rejoindre sur votre ordinateur (mais pas obligé) 😉\nJe lance à 19h pile 🔥🔥🔥\n\nÀ tout de suite !\nJB`
        : `\n\nHeyyyyyy,\nC'est bientôt le grand moment ! 🚀\n🚨 Si vous ne retrouvez pas votre lien, vous pouvez vous réinscrire juste ici :\n🔗 ${webinarUrl}\n\nComme ça vous aurez un nouveau lien sur la page de confirmation, ne le perdez pas !! \nJe vous conseille de rejoindre sur votre ordinateur (mais pas obligé) 😉\n\nJe lance à 19h pile 🔥🔥🔥\n\nÀ tout de suite !\nJB`,
  },

  // Message 9 – J-J à 18h50 JB (conditionnel)
  {
    sendOn: (date: Moment) => date.set({ hour: 18, minute: 50 }),
    message: (isLive: boolean, webinarUrl: string) =>
      isLive
        ? `3600 inscrits, je ne peux accueillir que 2000 personnes en live !!\nAlors connectez vous rapidement pour sécuriser votre place 💥 \n🔗 ${webinarUrl}\nA tout de suite !`
        : `a) SI EN REDIFFUSION \n3600 inscrits, je ne peux accueillir que 2000 personnes en live !!\nAlors connectez vous rapidement pour sécuriser votre place 💥 \n🔗 ${webinarUrl}\nA tout de suite !`,
  },

  // Message 10 – J-J à 19h (+ image 5) JB
  {
    image: "https://tutosexcel-assets.jbchauvin.fr/tcd/image 5.jpg",
    sendOn: (date: Moment) => date.set({ hour: 19, minute: 0 }),
    message: () => `📊 GOOOOOOOOOOOO ! 🔥`,
  },

  // Message 11 - 19h13 Flavie (conditionnel)
  {
    who: "flavie",
    sendOn: (date: Moment) => date.set({ hour: 19, minute: 13 }),
    message: (isLive: boolean, webinarUrl: string) =>
      isLive
        ? `L'introduction est terminée, il est encore temps de nous rejoindre en live pour découvrir la puissance des TCD !!\nPour nous rejoindre :\n🔗 ${webinarUrl}\n\nA tout de suite de l'autre côté 😉`
        : `Hello tout le monde !\n\nL'introduction est terminée, il est encore temps de nous rejoindre en live pour découvrir la puissance des TCD !!\nPour nous rejoindre, il vous suffit de vous réinscrire (gratuitement) juste ici  :\n${webinarUrl}\n\nA tout de suite de l'autre côté 😉`,
  },

  // Message 12 - 19h30 Flavie
  {
    who: "flavie",
    sendOn: (date: Moment) => date.set({ hour: 19, minute: 30 }),
    message: () => `Ça fait 30 minutes que JB est en live !\nLes meilleures astuces restent à venir 😍\nVous êtes chaud ce soir, ça fait plaisir\nEt bien sûr les bonus seront en téléchargement à la fin ✨`,
  },

  // Message 13 - 20h00 Flavie
  {
    who: "flavie",
    sendOn: (date: Moment) => date.set({ hour: 20, minute: 0 }),
    message: () => `Pour ceux qui se posent la question, JB mettra en téléchargement les fichiers à la fin du direct, mais attention, c'est que pour les présents ! \n\nPS : Si vous avez des problèmes de son / vidéo, ou des problèmes de connexion, pensez à rafraîchir la page, ça aide ! 😉`,
  },

  // Message 14 - 20h08 Flavie
  {
    who: "flavie",
    sendOn: (date: Moment) => date.set({ hour: 20, minute: 8 }),
    message: () => `Jean-Baptiste vient de l'annoncer en live 🤩 :\nVous pouvez, jusqu'à ce soir minuit, rejoindre Le Campus Excel pour enfin devenir un pro d'Excel en moins de 30 jours seulement !\nVoilà le lien d'inscription :\nhttps://tutosurexcel.thrivecart.com/masterclass-la-maitrise/`,
  },

  // Message 15 - 20h35 Flavie
  {
    who: "flavie",
    sendOn: (date: Moment) => date.set({ hour: 20, minute: 35 }),
    message: () => `On reçoit pas mal de questions sur la possibilité de payer en 5 fois.\nPas de souci ! C'est bien dispo sur ce lien :\nhttps://tutosurexcel.thrivecart.com/masterclass-la-maitrise/`,
  },

  // Message 16 - 21H20 (+ Image 4) Flavie
  {
    who: "flavie",
    image: "https://tutosexcel-assets.jbchauvin.fr/tcd/image 4.jpg",
    sendOn: (date: Moment) => date.set({ hour: 21, minute: 20 }),
    message: () => `Plusieurs personnes nous ont demandé si elles n'étaient pas trop débutantes pour rejoindre le programme.\n\nBonne nouvelle : la formation est conçue pour tous les niveaux, du grand débutant jusqu'à l'intermédiaire ++ 😀\nOn commence par les bases, vraiment le niveau 0, puis on progresse étape par étape, sans jamais vous laisser derrière 😉\n\nC'est d'ailleurs ce que les anciens participants ont le plus apprécié !`,
  },

  // Message 17 - J-J à 21h16 (+ Vidéo 2) JB
  {
    video: "https://tutosexcel-assets.jbchauvin.fr/tcd/Video 2.mp4",
    sendOn: (date: Moment) => date.set({ hour: 21, minute: 16 }),
    message: () => `Merci à tous pour votre présence 🙏`,
  },

  // Message 18 – J-J à 21h16 JB
  {
    sendOn: (date: Moment) => date.set({ hour: 21, minute: 16 }),
    message: () => `Voilà le replayyyyyyyy \nhttps://power.tutosurexcel.com/masterclass-tcd-replay\n\nToutes les infos sur l'offre sont dedans`,
  },

  // Message 19 - J-J à 21h31 JB (+ vidéo 3)
  {
    video: "https://tutosexcel-assets.jbchauvin.fr/tcd/Video 3.mp4",
    sendOn: (date: Moment) => date.set({ hour: 21, minute: 31 }),
    message: () => `OK pour le rappel de l'offre, jusqu'à ce soir minuit vous pouvez accéder à :\n✅ La Formation La Maîtrise\n✅ La Formation La Magie du VBA (pour automatiser votre travail)\n✅ Accès à la communauté privée dans laquelle je réponds à toutes les questions\n✅ Participe aux sessions en direct (1x par mois) -> La prochaine sera Mercredi soir\n✅ FORMATION Complète : Tableaux de Bord Excel\n✅ Assistant IA personnalisé\n✅ Certificat de complétion, pour attester de tes nouvelles compétences\n✅ Accès à vie, où vous voulez et quand vous voulez. \n\nBien sûr, garantie satisfait ou remboursé pendant 30 jours \nEt paiement en 5 fois disponible 🔥\nhttps://tutosurexcel.thrivecart.com/masterclass-la-maitrise/\n\nL'intégration de la formation VBA c'est vraiment un gros Bonus pour le coup, \nMaintenant le choix est entre vos mains !! :) \n\nJB`,
  },

  // Message 22 - 22H30 (+Image 6) FD
  {
    who: "flavie",
    image: "https://tutosexcel-assets.jbchauvin.fr/tcd/image 6.jpg",
    sendOn: (date: Moment) => date.set({ hour: 22, minute: 30 }),
    message: () => `👉 Voici les avis de Jerry, Nelly et Laure :\n\nIls étaient comme vous, ils se sentaient dépassés par les formules et les tableaux sur Excel.\n\nAujourd'hui ?\n\nIls automatisent leurs tâches, analysent leurs données en un clin d'œil et gagnent un temps fou ! 🚀\n\n💡Si eux l'ont fait, pourquoi pas vous ?`,
  },

  // Message 22 - 22H31 FD
  {
    who: "flavie",
    sendOn: (date: Moment) => date.set({ hour: 22, minute: 31 }),
    message: () => `Il est encore temps les rejoindre, et de bénéficier de la formation VBA pour automatiser votre travail dès demain 😛\nhttps://tutosurexcel.thrivecart.com/masterclass-la-maitrise/`,
  },

  // Message 23 - 23H00 Flavie
  {
    who: "flavie",
    sendOn: (date: Moment) => date.set({ hour: 23, minute: 0 }),
    message: () => `H-1 ⏰\nIl vous reste seulement quelques minutes pour profiter de cette offre exceptionnelle avant que le tarif ne double à minuit\nNe laissez pas passer cette opportunité unique de booster vos compétences Excel !\n👉 Cliquez vite ici pour nous rejoindre : https://tutosurexcel.thrivecart.com/masterclass-la-maitrise/`,
  },

  // Message 23.1 - 23H00 Flavie
  {
    who: "flavie",
    sendOn: (date: Moment) => date.set({ hour: 23, minute: 0 }),
    message: () => `Bravo à tous ceux qui ont pris leur avenir en main en rejoignant la formation ce soir 😍🔥\n\nElodie, Saloua, Léo, Daniel, Niry, Mariane, Bintou, Nathalie, ANDRY, SELELINO, Ghozlane, Annie, Marthe, Yamina, Pierre, peggy, Yosr, Nadia, Loïc, Nicolas, DOMINIQUE, Guylaine, MAUD, Anne, Patrice, Elodie, Eden, NICOLE, sebastien, Agnès, Mohamed, CHRISTELLE, Solange, Christophe, Sygrid, Corinne, Benoit, Fanny, Aurélia, jeanne, REGIS, Christine, Baelhadj, valerie, Margot, orianne, Emmanuèle, Sandrine, Catherine, Emmanuelle, Evan, Mylène, Séverine, Nadège, France-Marilyne, LAETITIA, Valide, Christian, claire, Michel, Mélanie, Mélanie, Tiffany, Gretta, FANNY, kaoutar, Mallaury, Virginie, lylian, Fernando, Karine, Frederic, ALINE, Patricia, Delphine, Gravellier, Christian, aufida, Muriel, AMELIE, xavier, Amal, Tiffany, isabelle, EMILIE, Jocelyne, Florence, Laura, Thierry, Giacomo, Isabelle, Olivier, LAETITIA…\n\n(Oui j'ai utilisé une fonction Excel pour combiner les prénoms 😛)`,
  },

  // Message 24 - 23H01 Flavie
  {
    who: "flavie",
    sendOn: (date: Moment) => date.set({ hour: 23, minute: 1 }),
    message: () => `Toutes ces personnes-là pourront :\n Devenir incontournable dans leur entreprise en 2025\n Gagner des heures de travail chaque semaine\n Éviter les erreurs coûteuses et travailler avec efficacité\n\n Profitez de cette remise spéciale avant qu'il ne soit trop tard :\nhttps://tutosurexcel.thrivecart.com/masterclass-la-maitrise/`,
  },

  // Message 25 - 23h30 FD
  {
    who: "flavie",
    sendOn: (date: Moment) => date.set({ hour: 23, minute: 30 }),
    message: () => `🔴 C'est maintenant ou jamais !\n30 minutes.\nC'est le temps qu'il vous reste pour gagner un temps fou et éliminer le stress face aux fichiers complexes sur Excel.\nhttps://tutosurexcel.thrivecart.com/masterclass-la-maitrise/`,
  },

  // Message 26 – J+1 à 19h
  {
    sendOn: (date: Moment) => date.add(1, "day").set({ hour: 19, minute: 0 }),
    message: () => `Hello tout le monde ! \n\nJ'espère que vous allez bien ! \nComme promis, la vidéo sur le graphique anneau qui se remplit 👀\nhttps://power.tutosurexcel.com/masterclass-tcd-bonus2`,
  },

  // Message 27 – J+1 à 19h01
  {
    sendOn: (date: Moment) => date.add(1, "day").set({ hour: 19, minute: 1 }),
    message: () => `Aussi, je voulais vous remercier une nouvelle fois pour votre participation à la Masterclass 🙏\nJe suis vraiment content que cette session vous ai plus\n\nOn a eu pas mal de messages concernant le délai trop court pour se décider, et beaucoup sont passés à côté de l'opportunité.\n(en plus j'ai eu un bug dans mes mails 😥)\n\nDu coup, j'ai décidé de laisser le replay de la Masterclass et de prolonger l'offre quelques jours de plus... \nComme ça, vous avez le temps de prendre une décision éclairée ☀ \n(même si le meilleur moyen, ça reste de tester, et si ça ne vous plait pas, vous avez toujours la garantie satisfait ou remboursé pendant 30 jours)\n\nEn plus, ça vous permet de voir avec votre employeur s' ils peuvent vous la rembourser (ça se fait très souvent pour info, et ça coûte rien de demander, au contraire même, ça montre que vous êtes dans une démarche de progression 😉\n\nToutes les infos sont dans le replay :\nhttps://power.tutosurexcel.com/masterclass-tcd-replay\n\nPS : Et oui, ça comprend toujours le bonus VBA et les rediffusions des anciennes Masterclass 🔥 `,
  },

  // Message 28 – J+2 à 19h (+ Image A)
  {
    image: "https://tutosexcel-assets.jbchauvin.fr/messages/ImageA.jpg",
    sendOn: (date: Moment) => date.add(2, "days").set({ hour: 19, minute: 0 }),
    message: () => `Bravo à tous ceux qui ont pris leur avenir en main en rejoignant la formation depuis dimanche soir 🔥\nPour ceux qui ne sont pas encore décidés, je vous remet juste ici le lien du replay, dans lequel vous retrouvez toutes les infos\nhttps://power.tutosurexcel.com/masterclass-tcd-replay`,
  },

  // Message 29 – J+2 à 19h
  {
    sendOn: (date: Moment) => date.add(2, "days").set({ hour: 19, minute: 0 }),
    message: () => `PS : Il est dispo jusqu'à vendredi soir ! \nL'accès à vie est réservé aux personnes rejoignant le Campus Excel ❤️`,
  },

  // Message 30 – J+3 à 19h
  {
    sendOn: (date: Moment) => date.add(3, "days").set({ hour: 19, minute: 0 }),
    message: () => `Hello tout le monde !\nJ'espère que vous commencez à gagner en efficacité !\nAvez-vous déjà mis en pratique certaines astuces de la Masterclass ?\n\n⏳ Rappel : Le replay est dispo jusqu'à vendredi soir !\n\nBeaucoup se font rembourser par leur employeurs, n'hésitez pas à demander ! \nça ne coûte rien, ça montre que vous êtes dans une démarche de progression\n\nBref c'est que du + !! \n\nJe vous remet le lien juste ici : \nhttps://power.tutosurexcel.com/masterclass-tcd-replay\n\nEt si vous avez besoin d'informations complémentaires, vous pouvez nous envoyer un mail à contact@tutosurexcel.com 🙂`,
  },

  // Message 31 – J+4 à 08h05
  {
    sendOn: (date: Moment) => date.add(4, "days").set({ hour: 8, minute: 5 }),
    message: () => `Helloooooo tout le monde ! \n\nJ'espère que vous passez une bonne semaine 🔥\n\nPetite vidéo bonus, comme promis, dans laquelle je vous montre comment refaire le graphique avec les cases d'options pour l'affichage des données 😍\nhttps://power.tutosurexcel.com/masterclass-tcd-bonus1\n\nBonne journée ! \nJB`,
  },

  // Message 34 – J+5 à 11h
  {
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 11, minute: 0 }),
    message: () => `Hello hello ! :) \n\nJ'espère que vous allez bien, \nPetit rappel, le replay et l'offre pour rejoindre le Campus expirent ce soir à 00h \n\nJe vous remet donc le lien pour le replay juste ici, si jamais vous n'avez pas envie de manger avec vos collègues ce midi, voilà la parfaite excuse 😂 \nhttps://power.tutosurexcel.com/masterclass-tcd-replay\n\nBon app !`,
  },

  // Message 35 – J+5 à 19h
  {
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 19, minute: 0 }),
    message: () => `J'ai aussi eu beaucoup de messages me demandant si la formation est adaptée aux débutants. \nLa réponse est un grand OUI !\n\nAu début, on reprend les bases et on évolue progressivement vers un niveau avancé, tout est pensé pour ne perdre personne en route.`,
  },

  // Message 36 – J+5 à 19h01 (+ Images 6--7-8)
  {
    images: [
      "https://tutosexcel-assets.jbchauvin.fr/tcd/image 6.jpg",
      "https://tutosexcel-assets.jbchauvin.fr/tcd/image 7.jpg",
      "https://tutosexcel-assets.jbchauvin.fr/tcd/image 8.jpg",
    ],
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 19, minute: 1 }),
    message: () => `C'est d'ailleurs ce que la plupart des retours que j'ai reçu cette semaine mentionnent 😍`,
  },

  // Message 37 – J+5 à 19h01
  {
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 19, minute: 1 }),
    message: () => `Il est encore de les rejoindre 😉\nhttps://tutosurexcel.thrivecart.com/masterclass-la-maitrise/`,
  },

  // Message 38 – J+5 à 19h05
  {
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 19, minute: 5 }),
    message: () => `Et pour rappel, il y a la garantie satisfait ou remboursé pendant 30 jours... \nUn simple mail suffit \n\nDonc vous ne prenez aucun risque à essayer, voir si c'est fait pour vous ou non \nEt prendre la décision avec toutes les cartes en main !!\n\nJe vous remet le lien une dernière fois\nhttps://tutosurexcel.thrivecart.com/masterclass-la-maitrise/\n\n✨ Le meilleur investissement que vous puissiez faire est sur vous même ✨`,
  },

  // Message 39 – J+5 à 20h00 (+Image 9)
  {
    image: "https://tutosexcel-assets.jbchauvin.fr/tcd/image 9.jpg",
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 20, minute: 0 }),
    message: () => `Allez je vous remet un avis Google, parce qu'il m'a vraiment fait plaisir `,
  },

  // Message 40 – J+5 à 20h01
  {
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 20, minute: 1 }),
    message: () => `Pour voir à quel point la formation peut changer votre quotidien 👉 https://tutosurexcel.thrivecart.com/masterclass-la-maitrise/`,
  },

  // Message 41 – J+5 à 20h30 (+ Image 11) Flavie
  {
    who: "flavie",
    image: "https://tutosexcel-assets.jbchauvin.fr/tcd/image 11.jpg",
    sendOn: (date: Moment) => date.add(5, "days").set({ hour: 20, minute: 30 }),
    message: () => `L'accès à vie et à toutes les mises à jour, c'est vraiment un bonus super apprécié ! 🔥🎁✅`,
  },

  // Message 42 – J+7 à 19h00
  {
    sendOn: (date: Moment) => date.add(7, "days").set({ hour: 19, minute: 0 }),
    message: () => `Hello tout le monde ! \n\nJ'espère que vous allez bien 😀\n\nJe suis toujours en quête d'amélioration, alors j'ai mis en place un petit formulaire pour avoir vos retours d'expérience sur la Masterclass Excel.\n\nÇa prend moins de 2 minutes à remplir, et moi ça m'aide à vous proposer des contenus toujours plus qualitatifs 🚀\n\nPour vous remercier de prendre le temps de le remplir, à la fin du formulaire vous avez le dossier récap de la Masterclass avec tous les fichiers bonus\nhttps://forms.gle/moSoShiwgtrkCLRA6\n\nBonne soirée,\nJB`,
  },
];
