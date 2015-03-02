// Starship is a namespace
if (typeof Starship == "undefined" || !Starship) {
    Starship = {};
}

(function() {
    Starship.generateSprite = function(type, size, color) {
		var canvas = document.createElement("canvas");
		canvas.width = 64;
		canvas.height = 64;
		var ctx = canvas.getContext("2d");
		if (type === "beacon") {
			ctx.strokeStyle = color;
			ctx.moveTo(32-size,32);
			ctx.lineTo(32+size,32);
			ctx.moveTo(32,32-size);
			ctx.lineTo(32,32+size);
            ctx.stroke();
        } else if (type === "object") {
			ctx.strokeStyle = color;
			//ctx.fillStyle = color;
			ctx.lineWidth = 2;
			ctx.lineJoin = "miter";
			ctx.beginPath();
			ctx.arc(32, 32, size, 0, 2*Math.PI);
			ctx.closePath();
			//ctx.fill();
			ctx.stroke();
        } else if (type === "ship") {
			var wire = [[1.0,0.0],[-1.0,-0.7],[-0.5,0.0],[-1.0,0.7]];
			//var wire = [[-0.5,0.0],[0.5,-0.3],[-0.5,-0.6],
			//               [-0.9,-0.6],[-0.8,-0.5],[-0.3,-0.4],
			//               [-0.6,-0.3],[-0.3,-0.2],[-0.8,-0.1],
			//               [-0.8,0.1],[-0.3,0.2],[-0.6,0.3],
			//               [-0.3,0.4],[-0.8,0.5],[-0.9,0.6],
			//               [-0.5,0.6],[0.5,0.3]];
			var p_rots = [];
			for (var i=0; i<wire.length; i++) {
				var p = wire[i];
				var p_rot = [];
				p_rot[0] = -p[1]*size + 32;
				p_rot[1] =  p[0]*size + 32;
				p_rots[p_rots.length] = p_rot;
			}
			ctx.strokeStyle = color;
			ctx.lineWidth = 2;
			ctx.beginPath();
			var p1 = p_rots[0];
			ctx.moveTo(p1[0], p1[1]);
			for (var i = 0; i < p_rots.length - 1; i++) {
				p1 = p_rots[i+1];
				ctx.lineTo(p1[0], p1[1]);
			}
			p1 = p_rots[0];
			ctx.lineJoin = "miter";
			ctx.closePath();
			ctx.stroke();
        } else if (type === "flame") {
			var flame = [[-0.75,-0.35],[-1.5,0.0],[-0.75,0.35]];
			var p_rots = [];
			for (var i=0; i<flame.length; i++) {
				var p = flame[i];
				var p_rot = [];
				p_rot[0] = -p[1]*size + 32;
				p_rot[1] =  p[0]*size + 32;
				p_rots[p_rots.length] = p_rot;
			}
			//ctx.beginPath();
			ctx.strokeStyle = color;
			var p1 = p_rots[0];
			ctx.moveTo(p1[0], p1[1]);
			for (var i = 0; i < p_rots.length - 1; i++) {
				p1 = p_rots[i+1];
				ctx.lineTo(p1[0], p1[1]);
			}
			ctx.stroke();
		}
		var texture = PIXI.Texture.fromCanvas(canvas,PIXI.scaleModes.DEFAULT)
		sprite = new PIXI.Sprite(texture);
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;
		return sprite;
    };
}());