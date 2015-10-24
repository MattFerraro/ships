// shipyard

(function() {
	var davis = {
		random:function (x){return (Math.floor(Math.random()*x));},
		
		bell: function (x)
			{
				var i=Math.round((davis.random(x)+davis.random(x)+davis.random(x))/3);
				return i;
			},
		
		randomColor:function (x,full){
			if (x){	x=x.toLowerCase();}
			else{x=="none"}
			if (!full){var full=false;}

			var red=davis.random(255);
			var green=davis.random(255);
			var blue=davis.random(255);
			if (x=="grey" || x=="gray" || x=="fullgrey" || x=="fullgray"){
				blue=red;
				green=red;
				}
			if (x=='warm' || x=='hot'){
				red=200+davis.random(55);
				blue=davis.random(30);
			}
			if (x=='cool' || x=='cold'){
				blue=100+davis.random(155);
				red=davis.random(50);
			}
			if (x=="mammal" || x=="mammalian"){
				red=160+davis.random(85);
				green=red-40;
				blue=green/2;
			}
			var color="rgb("+red+","+green+","+blue+")";

			if (full==true){
				var text="#eee";
				var alpha0="rgba("+red+","+green+","+blue+",0)";
				var alpha1="rgba("+red+","+green+","+blue+",1)";
				if ((red+green+blue)>400){text="#111";}
				return {red:red,green:green,blue:blue,rgb:color,text:text,alpha0:alpha0,alpha1:alpha1};
				}
			else{
				return color;
			}	
		},
		
		alpha:function(colorString,number){
			colorString=colorString.replace(/rgb/,"rgba");
			colorString=colorString.replace(/[)]/,(","+number+")"));
			return colorString;
		},

		maybe: function(n, d, f){
			var d = davis.random(d);
			if (d<n){
				f.call();
			}
			else{
				return false;
			}
		}
	};

	

	// mutate the average
	var ma=function(a,b,variance){
		var variance=variance || 0.2;
		var avg=(a+b)/2;
		avg= avg-(avg*variance)+davis.bell(2*avg*variance);
		if (avg<Math.min(a,b)){avg=Math.min(a,b);}
		if (avg>Math.max(a,b)){avg=Math.max(a,b);}
		return avg;
	};
	
	var ship=function(width, height){

		var canvas = document.createElement('CANVAS');
		var ctx = canvas.getContext('2d');
		//var ctx=c.context || false;
		var width = width || 100;
		var height = height || width;

	
		//mirror point
		var mp=function(x){
			return (width/2)-x+(width/2);
		};

		bilateral({context:ctx,width:width,height:height});

		var pattern=ctx.createPattern(ctx.canvas,"no-repeat");
		ctx.clearRect(0, 0, width, height);

		// g is for genome
		var g={};
		g.x0=0;
		g.x9=width/2;
		g.x4=ma((g.x9/2),g.x9,0.4);
		g.x6=ma(g.x4,g.x9);
		g.x7=ma(g.x6,g.x9);
		g.x8=ma(g.x7,g.x9,0.001);
		g.x5=ma(g.x0,g.x9,0.7);
		g.x1=ma(g.x0,g.x5,0.9);
		g.x3=ma(g.x1,g.x9,0.7);
		g.x2=ma(g.x1,g.x3);

		g.y0=0;
		g.y12=height;
		g.y4=ma(g.y0,g.y12,0.7);
		g.y2=ma(g.y0,g.y4);
		g.y3=ma(g.y2,g.y4);
		g.y1=ma(g.y0,g.y2);
		g.y7=ma(g.y4,g.y12,0.4);
		g.y6=ma(g.y7,g.y4);
		g.y9=ma(g.y7,g.y12,0.001);
		g.y8=ma(g.y7,g.y9,0.001);
		g.y11=ma(g.y7,g.y12,0.3);
		g.y5=ma(g.y0,g.y12,0.4);
		g.y10=ma(Math.max(g.y5,g.y7),g.y12,0.3);

		g.color=davis.randomColor("grey");
		ctx.lineWidth=Math.floor(width/70);
		ctx.strokeStyle="#000";

		// wings
		ctx.beginPath();
		ctx.lineTo(g.x1,g.y7);
		ctx.lineTo(g.x9,g.y6);
		ctx.lineTo(mp(g.x1),g.y7);
		ctx.lineTo(mp(g.x1),g.y8);
		ctx.lineTo(g.x9,g.y9);
		ctx.lineTo(g.x1,g.y8);
		ctx.lineTo(g.x1,g.y7);
		ctx.lineJoin='miter';
		ctx.fillStyle=davis.randomColor("grey");
		ctx.fill();
		ctx.stroke();

		davis.maybe(1,2,function(){ctx.fillStyle=g.color;});

		// abdomen
		ctx.beginPath();
		ctx.lineTo(g.x5,g.y4);
		ctx.lineTo(mp(g.x5),g.y4);
		ctx.lineTo(mp(g.x5),g.y11);
		ctx.lineTo(g.x5,g.y11);
		ctx.lineTo(g.x5,g.y4);
		ctx.lineJoin='miter';
		ctx.fill();
		davis.maybe(1,2,function(){
			ctx.fillStyle=pattern;
			ctx.fill();
			ctx.fillStyle=g.color;
		});
		ctx.stroke();

		//pods
		davis.maybe(2,3,function(){
			var podPattern=false;
			davis.maybe(1,2,function(){podPattern=true;});
			ctx.beginPath();
			ctx.lineTo(g.x2,g.y5);
			ctx.quadraticCurveTo(((g.x2+g.x3)/2),g.y5-(g.y5/10),g.x3,g.y5);
			ctx.lineTo(g.x3,g.y10);
			ctx.quadraticCurveTo(((g.x2+g.x3)/2),g.y10+(g.y5/10),g.x2,g.y10);
			ctx.lineTo(g.x2,g.y5);
			ctx.lineJoin='miter';
			ctx.fill();
			if (podPattern==true){
				ctx.fillStyle=pattern;
				ctx.fill();
				ctx.fillStyle=g.color;
			};
			ctx.stroke();


			ctx.beginPath();
			ctx.lineTo(mp(g.x2),g.y5);
			ctx.quadraticCurveTo(mp(((g.x2+g.x3)/2)),g.y5-(g.y5/10),mp(g.x3),g.y5);
			ctx.lineTo(mp(g.x3),g.y10);
			ctx.quadraticCurveTo(mp(((g.x2+g.x3)/2)),g.y10+(g.y5/10),mp(g.x2),g.y10);
			ctx.lineTo(mp(g.x2),g.y5);
			ctx.lineJoin='miter';
			ctx.fill();
			if (podPattern==true){
				ctx.fillStyle=pattern;
				ctx.fill();
				ctx.fillStyle=g.color;
			};
			ctx.stroke();
		});

		davis.maybe(1,2,function(){ctx.fillStyle=g.color;});

		// front
		ctx.beginPath();
		ctx.lineTo(g.x6,g.y1);
		ctx.quadraticCurveTo(g.x9,g.y0,mp(g.x6),g.y1);
		ctx.lineTo(mp(g.x4),g.y4);
		ctx.lineTo(g.x4,g.y4);
		ctx.lineTo(g.x6,g.y1);
		ctx.lineJoin='miter';
		ctx.fill();
		davis.maybe(1,2,function(){
			ctx.fillStyle=pattern;
			ctx.fill();
			ctx.fillStyle=g.color;
		});
		ctx.stroke();

		//cockpit
		ctx.beginPath();
		ctx.lineTo(g.x8,g.y2);
		ctx.lineTo(mp(g.x8),g.y2);
		ctx.lineTo(mp(g.x7),g.y3);
		ctx.lineTo(g.x7,g.y3);
		ctx.lineTo(g.x8,g.y2);
		ctx.lineJoin='miter';
		ctx.fillStyle="#eee";
		ctx.fill();
		ctx.stroke();

		// dorsal fin
		davis.maybe(6,7,function(){
			ctx.beginPath();
			ctx.lineTo(g.x7,g.y4);
			ctx.quadraticCurveTo(g.x9,g.y3,mp(g.x7),g.y4);
			ctx.lineTo(mp(g.x7),g.y4);
			ctx.lineTo(mp(g.x7),g.y11);
			ctx.quadraticCurveTo(g.x9,g.y9,g.x7,g.y11);
			ctx.lineTo(g.x7,g.y4);
			ctx.lineJoin='miter';
			ctx.fillStyle=g.color;
			ctx.fill();
		davis.maybe(1,2,function(){
			ctx.fillStyle=pattern;
			ctx.fill();
			ctx.fillStyle=g.color;
		});
			ctx.stroke();
		});

		//console.log(g);
		return canvas;
	}

	var circle=function(c){
		var ctx= c.context || false;
		var x=c.x || 100;
		var y=c.y || x;
		var r=c.r || 10;
		var color=c.color || davis.randomColor("grey");
		var fadeColor=c.fadeColor || "rgba(0,0,0,0)";
		var fadeRadius=c.fadeRadius || Math.random();
		var cr=ctx.canvas.width/2;
		//console.log(cw);
		var gradient=ctx.createRadialGradient(cr,cr,(fadeRadius*cr),cr,cr,cr);
		gradient.addColorStop(0,color);
		gradient.addColorStop(1,fadeColor);
		var lineWidth=c.lineWidth || 1;
		ctx.beginPath();
		ctx.arc(x,y,r,0,2*Math.PI);
		ctx.strokeStyle=gradient;
		ctx.lineWidth=lineWidth;

		ctx.stroke();


		return true;
	};

	var bilateral=function(c){
		var ctx=c.context;
		var width=c.width || 144;
		var height=c.height || width;
		var color=davis.randomColor();
		var strokeStyle=davis.alpha(davis.randomColor("grey"),(0.5+(Math.random()/2)));

		var fillStyle=davis.alpha(color,0);
		var lineWidth=width/100;

		davis.maybe(9,10,function(){
			lineWidth=0;
			fillStyle=color;
		});

		for (var i=0;i<4;i++){
			davis.maybe(1,2,function(){

				var r=(width/20)+davis.random(width/10);

				var x=r+lineWidth+davis.random((width/2)-r-lineWidth);
				var y=r+lineWidth+davis.random((height)-(2*(r+lineWidth)));
				ctx.beginPath();
				ctx.strokeStyle=strokeStyle;
				ctx.arc(x,y,r,0,2*Math.PI);
				ctx.lineWidth=lineWidth;
				ctx.fillStyle=fillStyle;
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				x=width/2+(width/2)-x;
				ctx.arc(x,y,r,0,2*Math.PI);
				ctx.fillStyle=fillStyle;
				ctx.fill();
				ctx.stroke();
			});
		}
		for (var i=0;i<3;i++){
			davis.maybe(1,2,function(){
				//var lineWidth=1+davis.random(width/100);
				var r=(width/20)+davis.random(width/2);
				var x=width/2;
				var y=r+lineWidth+davis.random((height)-(2*(r+lineWidth)));
				ctx.beginPath();
				ctx.strokeStyle=strokeStyle;
				ctx.arc(x,y,r,0,2*Math.PI);
				ctx.lineWidth=lineWidth;
				ctx.fillStyle=fillStyle;
				davis.maybe(1,3,function(){ctx.fill();});
				ctx.stroke();
			})
		}
	};

	ngon=function(c){
		var n=c.n || 3;

		var ctx= c.context || false;
		var x=c.x || 100;
		var y=c.y || x;
		var r=c.r || 100;
		if (n%2==0){
			var rotation=360/(n*2)*davis.random(n*2);
		} 
		else {
			var rotation=90+(180*davis.random(2));
		};
		rotation=c.rotation || rotation;
		var color=c.color || davis.randomColor("grey");
		var lineWidth=c.lineWidth || 1;
		var fill=c.fill || davis.randcomColor();
		ctx.beginPath();
		for (var i=0;i<n+2;i++){
			var nx=geo.getPoint(x,y,r,rotation+(i*360/n)).x2;
			var ny=geo.getPoint(x,y,r,rotation+(i*360/n)).y2;
			ctx.lineTo(nx,ny);
		}
		ctx.lineJoin='miter';
		ctx.strokeStyle=color;
		ctx.lineWidth=lineWidth;
		ctx.fillStyle=fill;
		ctx.fill();
		ctx.stroke();
		return true;
	};	

	var shipyard = function(width, height) {
		console.log('yolo');
		return ship(width, height);
	};

	window.shipyard = shipyard;
})()