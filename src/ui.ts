import { Marker, MarkerType } from './cfx/marker'
import { Color, Known } from './cfx/color'
import { Vector3 } from './cfx/vector'

const idleMarkerColor = Known.MarineBlue;
const capturingMarkerColor = Known.WeirdPurple;

const marker1 = new Marker(Vector3.Zero, 0, MarkerType.VerticalCylinder, idleMarkerColor);
const marker2 = new Marker(Vector3.Zero, 0, MarkerType.VerticalCylinder, idleMarkerColor);


