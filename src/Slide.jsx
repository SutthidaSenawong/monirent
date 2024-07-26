import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../index.css';

export default function Slide() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    <div className="slider-container">
      <Slider {...settings}>
        <div className="slide-wrapper  slide-1"></div>
        <div className="slide-wrapper  slide-2">
          <h1>
            Complete your dream <br /> remote workspace
            <br />
            with Monirent.
          </h1>
        </div>
        <div className="slide-wrapper  slide-3"></div>
      </Slider>
    </div>
  );
}
