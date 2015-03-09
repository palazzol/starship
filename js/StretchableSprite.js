
PIXI.StretchableSprite = function(texture)
{
    PIXI.Sprite.call( this, texture );

    this.scaleRotation = 0.0;
    this._ssr = 0.0;
    this._scr = 1.0;

    this.scaleRotationCache = 0.0;
    this._ssr = 0.0;
    this._scr = 1.0;
}

PIXI.StretchableSprite.prototype = Object.create(PIXI.Sprite.prototype);
PIXI.StretchableSprite.prototype.constructor = PIXI.StretchableSprite;

/*
 * Updates the object transform for rendering
 *
 * @method updateTransform
 * @private
 */

PIXI.StretchableSprite.prototype.updateTransform = function()
{
    // create some matrix refs for easy access
    var pt = this.parent.worldTransform;
    var wt = this.worldTransform;

    // temporary matrix variables
    var a, b, c, d, tx, ty;

	// check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
	//if(this.rotation !== this.rotationCache)
	{
		this.rotationCache = this.rotation;
		this._sr = Math.sin(-this.scaleRotation);
		this._cr = Math.cos(-this.scaleRotation);
	}

	//if(this.scaleRotation !== this.scaleRotationCache)
	{
		this.scaleRotationCache = this.scaleRotation;
		this._ssr = Math.sin(this.rotation+this.scaleRotation);
		this._scr = Math.cos(this.rotation+this.scaleRotation);
	}

	// get the matrix values of the displayobject based on its transform properties..
	//a  =  this._cr * this.scale.x;
	//b  =  this._sr * this.scale.x;
	//c  = -this._sr * this.scale.y;
	//d  =  this._cr * this.scale.y;
	var pa,pb,pc,pd;
	pa  =  this._scr * this.scale.x;
	pb  =  this._ssr * this.scale.x;
	pc  = -this._ssr * this.scale.y;
	pd  =  this._scr * this.scale.y;
	ptx = this.position.x;
	pty = this.position.y;

	var ca,cb,cc,cd;
	ca  =  this._cr;
	cb  =  this._sr;
	cc  = -this._sr;
    cd  =  this._cr;

    a = ca*pa + cb*pc;
    b = ca*pb + cb*pd;
    c = cc*pa + cd*pc;
    d = cc*pb + cd*pd;
    tx = ptx;
    ty = pty;

	// check for pivot.. not often used so geared towards that fact!
	if(this.pivot.x || this.pivot.y)
	{
		tx -= this.pivot.x * a + this.pivot.y * c;
		ty -= this.pivot.x * b + this.pivot.y * d;
	}

	// concat the parent matrix with the objects transform.
	wt.a  = a  * pt.a + b  * pt.c;
	wt.b  = a  * pt.b + b  * pt.d;
	wt.c  = c  * pt.a + d  * pt.c;
	wt.d  = c  * pt.b + d  * pt.d;
	wt.tx = tx * pt.a + ty * pt.c + pt.tx;
	wt.ty = tx * pt.b + ty * pt.d + pt.ty;

    // multiply the alphas..
    this.worldAlpha = this.alpha * this.parent.worldAlpha;
};

// performance increase to avoid using call.. (10x faster)
PIXI.StretchableSprite.prototype.displayObjectUpdateTransform = PIXI.StretchableSprite.prototype.updateTransform;
