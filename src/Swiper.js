import React, { useEffect, useRef, useState, useCallback } from 'react';

import './swiper.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleXmark,
  faCircleCheck,
  faHeart,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

const cardData = [
  {
    id: 1,
    name: 'Владислав',
  },
  {
    id: 2,
    name: 'Михаил',
  },
  {
    id: 3,
    name: 'Евгений',
  },
  {
    id: 4,
    name: 'Полина',
  },
  {
    id: 5,
    name: 'Дарья',
  },
];

const Swiper = (props) => {
  const { navigation } = props;

  const posRef = useRef();

  const [positionStart, setPositionStart] = useState();
  const [index, setIndex] = useState(cardData.length - 1);
  const [isDown, setIsDown] = useState(false);
  const [isShowDislike, setIsShowDislike] = useState(false);
  const [isShowLike, setIsShowLike] = useState(false);

  const thresholdValueOnSwipe = 100;

  const handlePointerDown = (e) => {
    // set start coords
    setPositionStart(e.clientX);

    // reset style transition
    e.target.style.transition = 'none';

    // set listener PointerUp
    const isNavClick = e.target.classList.contains(
      'swiper-card__navigation__circle'
    );

    if (!isNavClick) {
      setIsDown(true);

      window.addEventListener('pointerup', handlePointerUp);
    }
  };

  const handlePointerUp = useCallback(() => {
    setIsDown(false);

    // get current card and her current position
    const child = posRef.current.children[index];
    const currentPosCard = parseInt(child.style.left, 10);

    // Dislike
    if (currentPosCard < -thresholdValueOnSwipe) {
      AnimationSwipe(child, currentPosCard, setIndex, '-');
      console.log('left');
    }

    // Like
    else if (currentPosCard > thresholdValueOnSwipe) {
      AnimationSwipe(child, currentPosCard, setIndex, '+');
      console.log('right');
    }

    // Return to starting position
    else {
      child.style.left = 0;
      child.style.transition = '.2s left linear';

      console.log('stop');
    }

    // Reset swipe buttons state
    setIsShowDislike(false);
    setIsShowLike(false);

    window.removeEventListener('pointerup', handlePointerUp);
  }, [index]);

  const handlePointerMove = useCallback(
    (e) => {
      e.preventDefault();
      const card = posRef.current.children[index];

      if (isDown) {
        card.style.left = e.clientX - positionStart + 'px';
        const currentPosCard = parseInt(card.style.left, 10);

        // Show dislike icon
        if (currentPosCard < -thresholdValueOnSwipe) {
          setIsShowDislike(true);
        }

        // Show like icon
        else if (currentPosCard > thresholdValueOnSwipe) {
          setIsShowLike(true);
        }

        // Hide like/dislike btns
        else if (
          (currentPosCard >= -thresholdValueOnSwipe) &
          (currentPosCard <= thresholdValueOnSwipe)
        ) {
          setIsShowDislike(false);
          setIsShowLike(false);
        }
      }
    },
    [index, isDown, positionStart]
  );

  const LeftClick = (e) => {
    const child = posRef.current.children[index];
    AnimationSwipe(child, 0, setIndex, '-');
  };

  const RightClick = (e) => {
    const child = posRef.current.children[index];
    AnimationSwipe(child, 0, setIndex, '+');
  };

  // Set listeners PointerUp and PointerMove
  useEffect(() => {
    if (isDown) {
      window.addEventListener('pointermove', handlePointerMove);
    } else {
      window.removeEventListener('pointermove', handlePointerMove);
    }

    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [isDown, handlePointerMove]);

  // Remove listeners if cards not found
  useEffect(() => {
    if (index < 0) {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }
  }, [handlePointerUp, handlePointerMove, index]);

  return (
    <div className='swiper-container'>
      <FontAwesomeIcon
        icon={faCircleXmark}
        className={`status-icon cancel ${isShowDislike && 'show'}`}
      />
      <FontAwesomeIcon
        icon={faCircleCheck}
        className={`status-icon like ${isShowLike && 'show'}`}
      />
      <div ref={posRef} className='swiper' onPointerDown={handlePointerDown}>
        {index >= 0 ? (
          cardData.map(({ id, name }) => (
            <div key={id} className='swiper-card'>
              <span className='swiper-card__name'>{name}</span>
              {navigation && (
                <div className='swiper-card__navigation'>
                  <div
                    className='swiper-card__navigation__circle circle-dislike'
                    onClick={(e) => LeftClick(e)}
                  >
                    <FontAwesomeIcon icon={faXmark} className='dislike-icon' />
                  </div>
                  <div
                    className='swiper-card__navigation__circle circle-like'
                    onClick={(e) => RightClick(e)}
                  >
                    <FontAwesomeIcon icon={faHeart} className='like-icon' />
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className='swiper-card not-card'>
            <span>Карточки закончились</span>
          </div>
        )}
      </div>
    </div>
  );
};

const AnimationSwipe = (card, currentPosition, setIndex, sign) => {
  const shiftAmount = parseInt(`${sign}100`);

  card.style.left = currentPosition + shiftAmount + 'px';
  card.style.opacity = 0;
  card.style.transition = '.2s opacity linear, .2s left linear';

  console.log(card.style.left);

  // Remove card after 200 ms
  setTimeout(() => {
    cardData.pop();
    setIndex(cardData.length - 1);
  }, 200);
};

export default Swiper;
