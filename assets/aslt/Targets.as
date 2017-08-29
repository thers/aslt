import flash.geom.Matrix;

class aslt.Targets extends aslt.BaseClass {
	function Targets() {
		super();
	}
	
	function INITIALISE(parentMC)
	{
		super.INITIALISE(parentMC);
		
		this.CONTENT.attachMovie("Targets", "Targets_MC_" + name, this.CONTENT.getNextHighestDepth());
	}
}
