document.addEventListener("DOMContentLoaded", () => {
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
  const frameLength = 5;
  const StrikeBonusThrows = 3;
  const SpareBonusThrows = 2;
  let lancerLength = 3;
  let currentFrame = 1;
  let currentLancer = 1;
  let currentScore = 0;
  let maxInputValue = 15;
  let totalBonus = 0;
  let bonusArray = [];

  currentFrameSpan.textContent = currentFrame;
  currentLancerSpan.textContent = currentLancer;

  const frame = Array.from({ length: frameLength + 1 }, () => []);
  const frameScore = Array.from({ length: frameLength + 1 }, () => []);
  frameScore[0]=0;

  function assignScoreToFrame(nbFrame, nbLancer, score) {
    frame[nbFrame][nbLancer] = score;
    let frameTotal = frame[nbFrame].reduce((total, current) => total + (current ? parseInt(current) : 0), 0);
    
    frameScore[nbFrame] = frameTotal + frameScore[nbFrame-1];
  }

  function updateMaxInputValue() {
    const currentFrameScore = frame[currentFrame].reduce((total, current) => total + (current ? parseInt(current) : 0), 0);

    if (currentFrame === frameLength && currentFrameScore >= 15) {
      resultatInput.max = 15;
    } else {
      maxInputValue = 15 - currentFrameScore;
      resultatInput.max = maxInputValue;
    }

    resultatInput.value = 0;
  }

  function findNextThrows(frameIndex,bonusThrows) {
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

        const nextThrowTotal = nextThrows.reduce((total, current) => total + (current ? parseInt(current) : 0), 0);
        return nextThrowTotal;
    }


  function isStrike(nbFrame) {
    return frame[nbFrame][1] === '15';
  }

  function isSpare(nbFrame) {
        const frameTotal = frame[nbFrame].reduce((total, current) => total + (current ? parseInt(current) : 0), 0);
        return frameTotal === 15 && frame[nbFrame][1] !== '15';
    }

  let pendingStrikes = [];
  let pendingSpares = [];

  touchéeButton.addEventListener("click", () => {

    if((currentFrame === frameLength) && (isStrike(currentFrame) ||  isSpare(currentFrame))) {
        lancerLength = 4;
    }

    if ((currentFrame < frameLength + 1) && (currentLancer < lancerLength + 1)) {
      assignScoreToFrame(currentFrame, currentLancer, resultatInput.value);

      if (isStrike(currentFrame) && currentLancer === 1) {
        pendingStrikes.push(currentFrame);
      }

      bonusArray = [];

      for (let i = 0; i < pendingStrikes.length; i++) {
        const strikeFrame = pendingStrikes[i];
        if(strikeFrame !== 5){
            const nextStrikeThrowsTotal = findNextThrows(strikeFrame,StrikeBonusThrows);
            console.log(`Next 3 throws after strike at frame ${strikeFrame}:`, nextStrikeThrowsTotal);
            bonusArray.push(nextStrikeThrowsTotal);
        }
           

        }

      if (isSpare(currentFrame)) {
        pendingSpares.push(currentFrame);
      }

      for (let i = 0; i < pendingSpares.length; i++) {
            const spareFrame = pendingSpares[i];
            if(spareFrame !== 5){
                const nextSpareThrowsTotal = findNextThrows(spareFrame,SpareBonusThrows);
            console.log(`Next 2 throws after Spare at frame ${spareFrame}:`, nextSpareThrowsTotal);
            bonusArray.push(nextSpareThrowsTotal);
            }

        }

      


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


      currentScore += parseInt(resultatInput.value);
    }

    const totalBonus = bonusArray.reduce((total, current) => total + current, 0);
    currentFrameSpan.textContent = currentFrame;
    currentLancerSpan.textContent = currentLancer;
    totalBonusSpan.textContent = totalBonus;
    scoreSpan.textContent = currentScore + totalBonus;

    tab.innerHTML = "";
    console.log('lancerLength',lancerLength);

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
      let listItem = frameContent ? "<li>" + frameContent + strikeText + spareText +  bonusText + "</li>"  + frameScoreText  : "<li></li>";
      tab.innerHTML += listItem;
    }

    pendingStrikesSpan.textContent = pendingStrikes.join(", ");
    pendingSparesSpan.textContent = pendingSpares.join(", ");
    updateMaxInputValue();
  });
});