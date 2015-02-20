// Copyright 2002-2015, University of Colorado
/**
 * Shape that comprises a prism.
 * Immutable here but composed with a Property<Polygon> in Prism for mutability.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  //var Rectangle = require( 'KITE/Rectangle' );
  //var Vector2 = require( 'DOT/Vector2' );
  //var Intersection = require( 'BENDING_LIGHT/prisms/model/Intersection' );

  /**
   * Create a polygon with the specified corners
   * @param points
   * @param referencePointIndex
   * @constructor
   */
  function Polygon( points, referencePointIndex ) {

    this.points = [];
    //Index for the point used as the "reference" point,
    // which is used as the drag handle corner for rotation
    this.referencePointIndex = referencePointIndex;
  }

  return inherit( Object, Polygon, {
    /* //Convert to a java.awt.Shape
     toShape: function() {
     var path = new DoubleGeneralPath( points.get( 0 ) );
     for ( var point in points.subList( 1, points.size() ) ) {
     path.lineTo( point );
     }
     path.closePath();
     return path.getGeneralPath();
     },
     //Get the specified corner point
     getPoint: function( i ) {
     return points.get( i );
     },
     //Create a new Polygon translated by the specified amount
     getTranslatedInstance: function( dx, dy ) {
     return new Polygon( [].withAnonymousClassBody( {
     initializer: function() {
     for ( var point in points ) {
     add( point.plus( dx, dy ) );
     }
     }
     } ), referencePointIndex );
     },
     //Compute the intersections of the specified ray with this polygon's edges
     getIntersections: function( ray ) {
     var intersections = [];
     for ( var lineSegment in getEdges() ) {
     //Get the intersection if there is one
     var intersection = MathUtil.getLineSegmentsIntersection( lineSegment, new Line2D.Number( ray.tail.toPoint2D(), ray.tail.plus( ray.directionUnitVector.times( 1 ) ).toPoint2D() ) );
     if ( intersection != null && !isNaN( intersection.getX() ) && !isNaN( intersection.getY() ) ) {
     //Choose the normal vector that points the opposite direction of the incoming ray
     var normal1 = new Vector2( lineSegment.getP1(), lineSegment.getP2() ).getRotatedInstance( +Math.PI / 2 ).normalized();
     var normal2 = new Vector2( lineSegment.getP1(), lineSegment.getP2() ).getRotatedInstance( -Math.PI / 2 ).normalized();
     var unitNormal = ray.directionUnitVector.dot( normal1 ) < 0 ? normal1 : normal2;
     //Add to the list of intersections
     intersections.add( new Intersection( unitNormal, new Vector2( intersection ) ) );
     }
     }
     return intersections;
     },
     //List all bounding edges in the polygon

     //private
     getEdges: function() {
     var lineSegments = [];
     for ( var i = 0; i < points.size(); i++ ) {
     //make sure to loop from the last point to the first point
     var next = i == points.size() - 1 ? 0 : i + 1;
     lineSegments.add( new Line2D.Number( points.get( i ).toPoint2D(), points.get( next ).toPoint2D() ) );
     }
     return lineSegments;
     },
     getBounds: function() {
     return toShape().getBounds2D();
     },
     //Gets a rotated copy of this polygon
     getRotatedInstance: function( angle, rotationPoint ) {
     return new Polygon( [].withAnonymousClassBody( {
     initializer: function() {
     for ( var point in points ) {
     var vectorAboutCentroid = point.minus( rotationPoint );
     var rotated = vectorAboutCentroid.getRotatedInstance( angle );
     add( rotated.plus( rotationPoint ) );
     }
     }
     } ), referencePointIndex );
     },
     //Lists the corner points

     //private
     toPointArray: function() {
     var array = new Vector2[ points.size() ];
     for ( var i = 0; i < array.length; i++ ) {
     array[ i ] = points.get( i ).toPoint2D();
     }
     return array;
     },
     //Computes the centroid of the corner points (e.g. the center of "mass" assuming the corner points have equal "mass")
     getRotationCenter: function() {
     return new Vector2( PolygonUtils.getCentroid( toPointArray() ) );
     },
     //Just use the 0th point for the reference point for rotation drag handles
     getReferencePoint: function() {
     return new Option.Some( getPoint( referencePointIndex ) );
     },
     containsPoint: function( point ) {
     return toShape().contains( point.toPoint2D() );
     }*/
  } );
} );

