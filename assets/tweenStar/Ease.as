class tweenStar.Ease
{
  static var LINEAR = 0;
  static var QUADRATIC_IN = 1;
  static var QUADRATIC_OUT = 2;
  static var QUADRATIC_INOUT = 3;
  static var CUBIC_IN = 4;
  static var CUBIC_OUT = 5;
  static var CUBIC_INOUT = 6;
  static var QUARTIC_IN = 7;
  static var QUARTIC_OUT = 8;
  static var QUARTIC_INOUT = 9;
  static var SINE_IN = 10;
  static var SINE_OUT = 11;
  static var SINE_INOUT = 12;
  static var BACK_IN = 13;
  static var BACK_OUT = 14;
  static var BACK_INOUT = 15;
  static var CIRCULAR_IN = 16;
  static var CIRCULAR_OUT = 17;
  static var CIRCULAR_INOUT = 18;
  static var EaseTable = [
						  tweenStar.easing.Linear.easeNone,
						  tweenStar.easing.Quad.easeIn,
						  tweenStar.easing.Quad.easeOut,
						  tweenStar.easing.Quad.easeInOut,
						  tweenStar.easing.Cubic.easeIn,
						  tweenStar.easing.Cubic.easeOut,
						  tweenStar.easing.Cubic.easeInOut,
						  tweenStar.easing.Quart.easeIn,
						  tweenStar.easing.Quart.easeOut,
						  tweenStar.easing.Quart.easeInOut,
						  tweenStar.easing.Sine.easeIn,
						  tweenStar.easing.Sine.easeOut,
						  tweenStar.easing.Sine.easeInOut,
						  tweenStar.easing.Back.easeIn,
						  tweenStar.easing.Back.easeOut,
						  tweenStar.easing.Back.easeInOut,
						  tweenStar.easing.Circ.easeIn,
						  tweenStar.easing.Circ.easeOut,
						  tweenStar.easing.Circ.easeInOut
						  ];
  function Ease()
  {
  }
}
