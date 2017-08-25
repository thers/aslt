import flash.geom.Matrix;

class aslt.Targets extends aslt.BaseClass {
	function Targets() {
		super();
		
		trace('hey');
	}
	
	function INITIALISE(parentMC)
	{
		super.INITIALISE(parentMC);
		
		var that = this;
		
		
		var mtx:Matrix = new Matrix();
		mtx.translate(that.CONTENT.hitter._x + 10, that.CONTENT.hitter._y);
		mtx.c = -5 * (Math.PI / 180);
		
		this.CONTENT.hitter.transform.matrix = mtx;
		
		parentMC.onEnterFrame = function () {
			if (that.CONTENT.hitter.hitTest(parentMC._xmouse, parentMC._ymouse, true)) {
				that.CONTENT.hitter.txt.text = 'Yay, hit!';
				that.CONTENT.hitter._width = 500;
				mtx.a = that.CONTENT.hitter.transform.matrix.a;
				that.CONTENT.hitter.transform.matrix = mtx;
			} else {
				that.CONTENT.hitter.txt.text = 'Aw, no hit :c';
				that.CONTENT.hitter._width = 100;
				mtx.a = that.CONTENT.hitter.transform.matrix.a;
				that.CONTENT.hitter.transform.matrix = mtx;
			}
		}
	}
}
