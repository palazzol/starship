

# Experimental 2D Relativistic Starship Simulator #
(Launch web browser on js/index.html)

Controls:
* Thrust - space bar or yellow button
* Turn - left/right arrows or click/drag heading indicator
* Target - click on planet
* Toggle Observer/Measured viewpoint - Red button

Quick Speed Keys:
* 0-9 (0% - 90%c)
* ` (99%c)

# What am I looking at?

The "Observer view" shows all objects in the positions as they would appear, including delays due to distance. In other words, it shows objects where they intersect the ship's past light cone.

The "Measured view" shows all objects in the ship's notion of "now", which is essentially when they intersect his local plane t=0.  This is geometrically simpler, but it really only realstic for objects that "local" to the ship, where propagation delays are not significant.
