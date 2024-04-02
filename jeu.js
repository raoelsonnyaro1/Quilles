document.addEventListener("DOMContentLoaded", () => {
  // Sélection des éléments HTML
  const jeuForm = document.getElementById("jeuForm");
  const resultatInput = document.getElementById("resultat");
  const touchéeButton = document.getElementById("touchée");
  const currentFrameSpan = document.getElementById("currentFrame");
  const currentLancerSpan = document.getElementById("currentLancer");
  const scoreSpan = document.getElementById("score");
  const tab = document.getElementById("tab");
  const pendingStrikesSpan = document.getElementById("pendingStrikes");
  const pendingSparesSpan = document.getElementById("pendingSpares");
  const totalBonusSpan = document.getElementById("totalBonus");

  // Définition des constantes
  const frameLength = 5;
  const StrikeBonusThrows = 3;
  const SpareBonusThrows = 2;

  // Initialisation des variables
  let lancerLength = 3;
  let currentFrame = 1;
  let currentLancer = 1;
  let currentScore = 0;
  let maxInputValue = 15;
  let totalBonus = 0;
  let bonusArray = [];

  // Initialisation des éléments HTML
  currentFrameSpan.textContent = currentFrame;
  currentLancerSpan.textContent = currentLancer;

  // Initialisation des tableaux de données
  const frame = Array.from({ length: frameLength + 1 }, () => []);
  const frameScore = Array.from({ length: frameLength + 1 }, () => []);
  frameScore[0] = 0;

  // Fonction pour attribuer un score à une frame
  function assignScoreToFrame(nbFrame, nbLancer, score) {
      frame[nbFrame][nbLancer] = score;
      let frameTotal = frame[nbFrame].reduce((total, current) => total + (current ? parseInt(current) : 0), 0);
      frameScore[nbFrame] = frameTotal + frameScore[nbFrame - 1];
  }

  // Fonction pour mettre à jour la valeur maximale de l'input
  function updateMaxInputValue() {
      const currentFrameScore = frame[currentFrame].reduce((total, current) => total + (current ? parseInt(current) : 0), 0);
      resultatInput.max = (currentFrame === frameLength && currentFrameScore >= 15) ? 15 : 15 - currentFrameScore;
      resultatInput.value = 0;
  }

  // Fonction pour trouver les lancers suivants pour les bonus
  function findNextThrows(frameIndex, bonusThrows) {
      const nextThrows = [];
      let throwsCount = 0;
      let nextFrameIndex = frameIndex + 1;

      while (nextThrows.length < 3 && nextFrameIndex <= frameLength) {
          for (let i = 1; i < frame[nextFrameIndex].length; i++) {
              if (frame[nextFrameIndex][i] !== undefined && throwsCount < bonusThrows) {
                  nextThrows.push(parseInt(frame[nextFrameIndex][i]));
                  throwsCount++;
              }
          }
          nextFrameIndex++;
      }

      return nextThrows.reduce((total, current) => total + (current ? parseInt(current) : 0), 0);
  }

  // Fonction pour vérifier si c'est un strike
  function isStrike(nbFrame) {
      return frame[nbFrame][1] === '15';
  }

  // Fonction pour vérifier si c'est un spare
  function isSpare(nbFrame) {
      const frameTotal = frame[nbFrame].reduce((total, current) => total + (current ? parseInt(current) : 0), 0);
      return frameTotal === 15 && frame[nbFrame][1] !== '15';
  }

  // Tableaux pour stocker les strikes et spares en attente
  let pendingStrikes = [];
  let pendingSpares = [];

  // Événement click sur le bouton de lancer
  touchéeButton.addEventListener("click", () => {
      // Gestion de la longueur des lancers pour la dernière frame
      if ((currentFrame === frameLength) && (isStrike(currentFrame) || isSpare(currentFrame))) {
          lancerLength = 4;
      }

      if ((currentFrame < frameLength + 1) && (currentLancer < lancerLength + 1)) {
          // Attribution du score à la frame
          assignScoreToFrame(currentFrame, currentLancer, resultatInput.value);

          // Gestion des strikes
          if (isStrike(currentFrame) && currentLancer === 1) {
              pendingStrikes.push(currentFrame);
          }

          // Calcul des bonus pour les strikes
          bonusArray = [];
          for (let i = 0; i < pendingStrikes.length; i++) {
              const strikeFrame = pendingStrikes[i];
              if (strikeFrame !== 5) {
                  const nextStrikeThrowsTotal = findNextThrows(strikeFrame, StrikeBonusThrows);
                  bonusArray.push(nextStrikeThrowsTotal);
              }
          }

          // Gestion des spares
          if (isSpare(currentFrame)) {
              pendingSpares.push(currentFrame);
          }

          // Calcul des bonus pour les spares
          for (let i = 0; i < pendingSpares.length; i++) {
              const spareFrame = pendingSpares[i];
              if (spareFrame !== 5) {
                  const nextSpareThrowsTotal = findNextThrows(spareFrame, SpareBonusThrows);
                  bonusArray.push(nextSpareThrowsTotal);
              }
          }

          // Mise à jour des compteurs de frame et de lancer
          if (currentFrame < 5 && (isStrike(currentFrame) || isSpare(currentFrame))) {
              currentFrame++;
              currentLancer = 1;
          } else if ((currentFrame === 5 && isStrike(currentFrame)) || !isStrike(currentFrame)) {
              currentLancer++;
          }

          if (currentFrame < 5 && currentLancer === 4) {
              currentLancer = 1;
              currentFrame++;
          } else if (currentFrame === 5 && currentLancer === 4) {
              currentLancer = 4;
          }

          // Mise à jour du score total et des éléments d'interface utilisateur
          currentScore += parseInt(resultatInput.value);
          const totalBonus = bonusArray.reduce((total, current) => total + current, 0);
          currentFrameSpan.textContent = currentFrame;
          currentLancerSpan.textContent = currentLancer;
          totalBonusSpan.textContent = totalBonus;
          scoreSpan.textContent = currentScore + totalBonus;

          // Mise à jour de l'affichage des frames dans le tableau
          tab.innerHTML = "";
          for (let i = 1; i < frameLength + 1; i++) {
              let frameContent = frame[i].filter(score => score !== undefined).join(" / ");
              let strikeText = isStrike(i) ? " (Strike)" : "";
              let spareText = isSpare(i) ? " (Spare)" : "";
              let bonusText = "";

              if (isStrike(i)) {
                  bonusText = " (Strike Bonus: " + findNextThrows(i, StrikeBonusThrows) + ")";
              } else if (isSpare(i)) {
                  bonusText = " (Spare Bonus: " + findNextThrows(i, SpareBonusThrows) + ")";
              }

              let frameScoreText = frameScore[i] !== undefined ? "Frame " + i + " score: " + frameScore[i] : "";
              let listItem = frameContent ? "<li>" + frameContent + strikeText + spareText + bonusText + "</li>" + frameScoreText : "<li></li>";
              tab.innerHTML += listItem;
          }

          // Mise à jour de l'affichage des strikes et spares en attente
          pendingStrikesSpan.textContent = pendingStrikes.join(", ");
          pendingSparesSpan.textContent = pendingSpares.join(", ");

          // Mise à jour de la valeur maximale de l'input
          updateMaxInputValue();
      }
  });
});
