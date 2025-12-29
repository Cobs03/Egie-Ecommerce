import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import PopupAdService from '../services/PopupAdService';

const PopupAdModal = ({ page = 'home' }) => {
  const [currentPopup, setCurrentPopup] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [popupQueue, setPopupQueue] = useState([]);
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);

  useEffect(() => {
    loadPopups();
  }, [page]);

  const loadPopups = async () => {
    const { data: popups } = await PopupAdService.getActivePopupAds(page);
    
    if (popups && popups.length > 0) {
      // Filter popups that should be shown (check display frequency)
      const popupsToShow = popups.filter(popup => 
        PopupAdService.shouldShowPopup(popup.id, popup.display_frequency)
      );

      if (popupsToShow.length > 0) {
        setPopupQueue(popupsToShow);
        showNextPopup(popupsToShow, 0);
      }
    }
  };

  const showNextPopup = (queue, index) => {
    if (index >= queue.length) return;

    const popupToShow = queue[index];

    // Delay before showing
    setTimeout(() => {
      setCurrentPopup(popupToShow);
      setIsVisible(true);
      setCurrentSlideIndex(0);
      
      // Track impression
      PopupAdService.trackImpression(popupToShow.id);
      PopupAdService.markAsShown(popupToShow.id, popupToShow.display_frequency);

      // Auto-close if specified
      if (popupToShow.auto_close_seconds) {
        setTimeout(() => {
          handleClose(queue, index);
        }, popupToShow.auto_close_seconds * 1000);
      }
    }, (popupToShow.delay_seconds || 2) * 1000);
  };

  const handleClose = (queue = popupQueue, index = currentPopupIndex) => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setCurrentPopup(null);
      setIsClosing(false);
      setCurrentSlideIndex(0);

      // Show next popup if available
      const nextIndex = index + 1;
      if (nextIndex < queue.length) {
        setCurrentPopupIndex(nextIndex);
        // Wait a bit before showing next popup (1 second)
        setTimeout(() => {
          showNextPopup(queue, nextIndex);
        }, 1000);
      }
    }, 300);
  };

  const handleClick = () => {
    if (currentPopup?.link_url) {
      PopupAdService.trackClick(currentPopup.id);
      window.open(currentPopup.link_url, '_blank');
    }
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    if (currentPopup?.images) {
      setCurrentSlideIndex((prev) => 
        prev === currentPopup.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    if (currentPopup?.images) {
      setCurrentSlideIndex((prev) => 
        prev === 0 ? currentPopup.images.length - 1 : prev - 1
      );
    }
  };

  if (!isVisible || !currentPopup) return null;

  const hasMultipleSlides = currentPopup.images?.length > 1;
  const isClickable = currentPopup.link_url;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Close popup"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        {/* Image Container */}
        <div 
          className={`relative ${isClickable ? 'cursor-pointer' : ''}`}
          onClick={isClickable ? handleClick : undefined}
        >
          {currentPopup.images && currentPopup.images.length > 0 && (
            <>
              <img
                src={currentPopup.images[currentSlideIndex]}
                alt={currentPopup.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />

              {/* Navigation Arrows for Multiple Slides */}
              {hasMultipleSlides && (
                <>
                  <button
                    onClick={handlePrevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>

                  <button
                    onClick={handleNextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>

                  {/* Slide Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {currentPopup.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSlideIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentSlideIndex
                            ? 'bg-white w-8'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Click hint if clickable */}
        {isClickable && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
            <p className="text-white text-sm text-center">
              Click to learn more
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupAdModal;
