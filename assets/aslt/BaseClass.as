class aslt.BaseClass extends MovieClip
{
  function BaseClass()
  {
    super();
  }
  
  function INITIALISE(mc)
  {
    this.TIMELINE = mc;
    this.CONTENT = this.TIMELINE.attachMovie("CONTENT", "CONTENT", this.TIMELINE.getNextHighestDepth());
	this.CONTENT._x = 0;
	this.CONTENT._y = 0;
  }
}