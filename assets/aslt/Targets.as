import flash.geom.Matrix;

class aslt.Targets extends aslt.BaseClass {
	var STATE_CAPTURING = 1;
	var STATE_CONTESTED = 2;
	var STATE_CAPTURED = 3;
	
	function Targets() {
		super();
	}
	
	function INITIALISE(parentMC)
	{
		super.INITIALISE(parentMC);
		
		this.targets = this.CONTENT.attachMovie("Targets", "Targets_MC_" + name, this.CONTENT.getNextHighestDepth());
		
		this.targets.status.html = true;
		this.targets.counter.html = true;
		this.targets.targetStatus.html = true;
		
		this.RESET();
	}
	
	function RESET()
	{
		this.targets.targetBar._width = 0;
	}
	
	function SET_STATE(txt)
	{
		this.targets.status.htmlText = txt;
	}
	
	function SET_TEAM(team)
	{
		var colour = this.getTeamColour(team);
		var title = this.getTeamTitle(team);
			
		this.targets.status.htmlText = 'TEAM <font color="' + colour + '">' + title + '</font>';
	}
	
	function SET_SCORE(firstTeam, secondTeam)
	{
		this.targets.counter.htmlText = this.wrapWithColour('•', this.getTeamColour(0)) +
			(firstTeam|0).toString() + 
			'<font color="#cccccc">:</font>' +
			(secondTeam|0).toString() +
			this.wrapWithColour('•', this.getTeamColour(1));
	}
	
	function SET_COUNTER(txt)
	{
		this.targets.counter.htmlText = txt;
	}
	
	function SET_TARGETS_COUNT(txt)
	{
		this.targets.targetsCount.text = txt;
	}
	
	function SET_TARGET_PROGRESS(progress, state, team)
	{
		state = state|0;
		team = team|0;
		
		var color = 0xffffff;
		var targetStatus = 'TARGET';
		
		if (state == this.STATE_CAPTURING)
		{
			color = this.getTeamColorRGB(team);
			targetStatus = 'CAPTURING';
		}
		
		if (state == this.STATE_CONTESTED)
		{
			color = 0xffd600;
			targetStatus = 'CONTESTED';
		}
		
		if (state === this.STATE_CAPTURED)
		{
			color = 0x96cc00;
			targetStatus = 'CAPTURED';
		}
		
		this.targets.targetStatus.htmlText = targetStatus;
		this.targets.targetBar._width = 130 * progress;
		this.applyRGBToMC(this.targets.targetBar, color);
	}
	
	function getTeamColoured(team)
	{
		return this.wrapWithColour(this.getTeamTitle(team), this.getTeamColour(team));
	}
	
	function getTeamTitle(team)
	{
		return team == 0
			? 'FUCHSIA'
			: 'CYAN';
	}
	
	function getTeamColour(team)
	{
		return team == 0
			? '#E4003F'
			: '#00D9E4';
	}
	
	function getTeamColorRGB(team)
	{
		return team == 0
			? 0xE4003F
			: 0x00D9E4;
	}
	
	function applyColourToMC(mc, r, g, b)
	{
		r = (255 - r) * -1;
		g = (255 - g) * -1;
		b = (255 - b) * -1;
		
		var transform = new flash.geom.Transform(mc);
		transform.colorTransform = new flash.geom.ColorTransform(1, 1, 1, 1, r, g, b, 0);
	}
	
	function applyRGBToMC(mc, rgb)
	{
		var r = (rgb & 0xFF0000) >> 16;
		var g = (rgb & 0xFF00) >> 8;
		var b = rgb & 0xFF;
		
		this.applyColourToMC(mc, r, g, b);
	}
	
	function wrapWithColour(txt, color)
	{
		return '<font color="' + color + '">' + txt + '</font>';
	}
}
