// Import stylesheets
import './style.css';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');

//#region Functions

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians) {
  return radians * (180 / Math.PI);
}

//#endregion 

//#region Canvas

var canvas = document.body.appendChild(document.createElement("canvas"));
canvas.width = 700;
canvas.height = 700;

var ctx = canvas.getContext("2d");
ctx.translate(50, 400);

//#endregion 

//#region Interfaces 

interface IDraw{
  Draw();
}

interface ICanvasContextElement{

  type: CanvasContextElement;
  startPoint :Poind2d;
  endPoint :Poind2d;

  Draw();

}

//#endregion 

//#region DataObjects 

export class Poind2d {

  public parentId: number;
  
  public x: number;
  public y: number;

  constructor(x:number, y: number){

    this.x = x;
    this.y = y;

  }

}

//#endregion 

//#region CanvasContextElements

export enum CanvasContextElement{

  Unknown,
  Point,
  Arc,
  Cone,
  LineHorizontal,
  LineVertical

}

export class Line implements ICanvasContextElement {

  public id: number;
  public parentId: number;

  public type = CanvasContextElement.Unknown;

  public startPoint :Poind2d;
  public endPoint :Poind2d;

  constructor(id: number, startPoint:Poind2d, endPoint: Poind2d){

    this.id = id;
    this.startPoint = startPoint;
    this.startPoint.parentId = this.id;
    this.endPoint = endPoint;
    this.endPoint.parentId = this.id;

  }

  public Draw (){ 

    ctx.beginPath();
    ctx.moveTo(this.startPoint.x,this.startPoint.y);
    ctx.lineTo(this.endPoint.x,this.endPoint.y);
    ctx.stroke();

  }

}

export class Arc implements ICanvasContextElement {

  public id: number;
  public parentId: number;

  public type = CanvasContextElement.Arc;

  public centerPoint :Poind2d;
  public startPoint :Poind2d;
  public endPoint :Poind2d;

  public anticlockwise : boolean;

  public radius :number;
  public startAngle :number;
  public endAngle :number;

  constructor(id: number, centerPoint: Poind2d, radius: number, startAngle :number, endAngle :number, anticlockwise : boolean = false){

    this.id = id;
    this.centerPoint = centerPoint;
    this.centerPoint.parentId = this.id;

    this.anticlockwise = anticlockwise;

    this.radius = radius;
    this.startAngle = degreesToRadians(startAngle);
    this.endAngle = degreesToRadians(endAngle);

  }

  public Draw (){ 

    ctx.beginPath();
    ctx.arc(this.centerPoint.x, this.centerPoint.y, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
    ctx.stroke();

  }

}

export class Point implements ICanvasContextElement {

  public id: number;
  public parentId: number;

  public type = CanvasContextElement.Point;

  public startPoint :Poind2d;
  public endPoint :Poind2d;

  constructor(id: number, point:Poind2d){

    this.id = id;
    this.startPoint = point;
    this.startPoint.parentId = this.id;
    this.endPoint = point;
    this.endPoint.parentId = this.id;

  }

  public Draw (){ 

    ctx.beginPath();
    ctx.arc(this.startPoint.x, this.startPoint.y, 1, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fill();

  }

}

//#endregion 


export class CompositeCurve implements IDraw {

  public id: number;
  public parentId: number;
  
  public elements  = new Array<ICanvasContextElement>();

  constructor(id:number, startPoint: Poind2d){

    this.id = id;

    this.elements.push(new Point(1, startPoint));

  }

  public Draw(){ 

    this.elements.forEach(e => e.Draw());

  }

//#region Last Element Methodes

  public get lastElement(){ 

    return this.elements[this.elements.length - 1];

  }

  public get lastElementAngle(){ 

    let y = this.lastElementHeight;
    let x = this.lastElementLength;

    if(x == 0) return 90;
    if(y == 0) return 0;

    return parseFloat(radiansToDegrees(Math.atan(y/x)).toFixed(3));

  }
  
  public get lastElementLength(){ 
    return parseFloat((this.lastElement.endPoint.x - this.lastElement.startPoint.x).toFixed(3));
  }

  public get lastElementHeight(){ 
    return parseFloat((this.lastElement.endPoint.y  - this.lastElement.startPoint.y).toFixed(3));
  }

//#endregion

  public SetLineHorizontal(lenght:number){ 
 
    let lastPoint  = this.lastElement.endPoint;
    let point = new Poind2d(lastPoint.x - lenght, lastPoint.y);
    let  line = new Line(this.id, lastPoint, point);
    line.parentId = this.id;
    line.type = CanvasContextElement.LineHorizontal;
    this.elements.push(line);

  }

  public SetLineVertical(heigth:number){ 
 
    let lastPoint  = this.lastElement.endPoint;
    let point = new Poind2d(lastPoint.x, lastPoint.y - heigth);
    let  line = new Line(this.id, lastPoint, point);
    line.parentId = this.id;
    line.type = CanvasContextElement.LineVertical;
    this.elements.push(line);

  }

  public SetConeByLengthAndHeight(lenght:number, heigth:number){ 
 
    let lastPoint  = this.lastElement.endPoint;
    let point = new Poind2d(lastPoint.x - lenght, lastPoint.y - heigth);
    let  line = new Line(this.id, lastPoint, point);
    line.parentId = this.id;
    line.type = CanvasContextElement.Cone;
    this.elements.push(line);

  }

  public SetConeByLengthAndAngle(length:number, angle:number){ 
 
    let heigth = Math.tan(degreesToRadians(angle)) * length;
    let lastPoint  = this.lastElement.endPoint;
    let point = new Poind2d(lastPoint.x - length, lastPoint.y - heigth);
    let  line = new Line(this.id, lastPoint, point);
    line.parentId = this.id;
    line.type = CanvasContextElement.Cone;
    this.elements.push(line);

  }

  public SetInnerArc(radius: number, angle: number){ 
 
    let arcAngle = 90 + this.lastElementAngle;

    let arcX = this.lastElement.endPoint.x + 
               parseFloat((Math.sin(this.lastElementHeight/this.lastElementLength) * radius).toFixed(3));
    let arcY = this.lastElement.endPoint.y - 
               parseFloat((Math.cos(this.lastElementHeight/this.lastElementLength) * radius).toFixed(3));

    let centerPoint = new Poind2d(arcX, arcY);
    
    let endX = centerPoint.x - 
               parseFloat((Math.sin(degreesToRadians(angle)) * radius).toFixed(3));
    let endY = centerPoint.y + 
               parseFloat((Math.sin(degreesToRadians(angle)) * radius).toFixed(3));

    let arc = new Arc(this.id, centerPoint, radius, arcAngle, 90 + angle);
    arc.startPoint = this.lastElement.endPoint;
    arc.endPoint = new Poind2d(endX, endY);
    arc.parentId = this.id;
    this.elements.push(arc);

  }

  public SetOutterArc(radius: number, angle: number){ 
 
    let arcAngle = 0 + this.lastElementAngle + 90;
    alert(arcAngle);

    let arcX = this.lastElement.endPoint.x - 
               parseFloat((Math.sin(this.lastElementHeight/this.lastElementLength) * radius).toFixed(3));
    let arcY = this.lastElement.endPoint.y + 
               parseFloat((Math.cos(this.lastElementHeight/this.lastElementLength) * radius).toFixed(3));

               alert(arcX);
               alert(arcY);
    let centerPoint = new Poind2d(arcX, arcY);
    let p = new Point(44, centerPoint);
    p.Draw();

    let endX = centerPoint.x - 
               parseFloat((Math.sin(degreesToRadians(angle)) * radius).toFixed(3));
    let endY = centerPoint.y + 
               parseFloat((Math.sin(degreesToRadians(angle)) * radius).toFixed(3));

    let arc = new Arc(this.id, centerPoint, radius, arcAngle, angle, true);
    arc.startPoint = this.lastElement.endPoint;
    arc.endPoint = new Poind2d(endX, endY);
    arc.parentId = this.id;
    this.elements.push(arc);

  }

  public SetArc(type: ArcType, radius: number, angle: number){ 

    let l = this.lastElement;

    //#region Fall 1:

    if(Math.abs(l.endPoint.y - l.startPoint.y)<0.001){

    }
    
    //#endregion

    //#region Fall 2:

    //#endregion

    //#region Fall 3:

    //#endregion

    //#region Fall 4:

    //#endregion

  }

}

enum ArcType {
  Inner,
  Oute
}

let pS = new Poind2d(450,0);

let comp = new CompositeCurve(12, pS);

comp.SetLineVertical(100);
comp.SetLineHorizontal(200);

comp.SetConeByLengthAndAngle(50, 15);
comp.SetInnerArc(30, 45);

comp.SetConeByLengthAndHeight(50,45);
comp.SetLineVertical(50);

comp.SetOutterArc(50, 90);

comp.Draw();

alert("hallo");




