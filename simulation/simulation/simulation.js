/* Variables */
const FONT_SIZE = 20;      // Size of the font
const G = 9.8;             // Gravity constant
const MAX_DIST = 5;        // Maximum distance robot can be from hoop
const ROBOT_SIZE = 90;     // Size of the robot sphere
const BALL_SIZE = 24;      // Size of the basketball sphere
const BASKET_HEIGHT = 305; // Height of the basket

let scale;             // Scaling factor for the calculations
let scale_slider;       // Scale slider object

let angle_rate;        // Rate of change of angle
let angle_rate_slider; // Slider for changing rate of change of angle

let hoop_x, hoop_y;    // x and y coords of the hoop center


/*
  Function to map a launch angle given a distance
  
  *  start_x = x coord of robot
  *  end_x = x coord of hoop
  *  rate = rate of change of angle
*/
function calc_theta(start_x, end_x, rate) {
  let dist = (end_x - start_x)/10;  // Calculate the distance between the robot and the hoop
  return (-rate*dist + 90);          // Linear mapping of distance to the angle
}


/* 
  Function to calculate the launch velocity using the trajectory displacement equation (see https://courses.lumenlearning.com/boundless-physics/chapter/projectile-motion/)
  
  The equation used is below:
    v = sqrt( G*dist^2 / (dist*tan(theta) - basket_height)*(2*cos^2(theta)) )
    
  *  theta = launch angle of projectile
  *  start_x, start_y = coordinates of robot
  *  end_x, end_y = coordinates of the basket hoop
*/
function calc_velocity(theta, start_x, start_y, end_x, end_y) {
  let angle = radians(theta);
  let cos2 = cos(angle)*cos(angle);                            // Cosine squared
  let x_dist = end_x - start_x;                                // Distance between robot and hoop (x displacement)
  let y_dist = -1*(end_y - start_y);                           // Distance from robot to hoop (y displacement)
  let denominator = ((x_dist*tan(angle) - y_dist)*(2*cos2));   // Bottom half of the given equation
  
  // If the bottom half of the equation is negative, make it positive
  if (denominator < 0) {
    denominator *= -1;
  }
  
  // Return the calculated velocity
  return sqrt((G*x_dist*x_dist)/denominator);
}


/*
  Function to draw the basketball hoop
  
  *  basket_x, basket_y = center x and y coords of the basket
*/
function draw_hoop(target_x, target_y) {
  const BASKET_DIAMETER = 46;
  const BASKET_THICK = 5;
  const BACKBOARD_HEIGHT = 122;
  const BACKBOARD_THICK = 10;
  const DIST_TO_BASKET = 13;
  const POST_THICK = 15;
  
  let basket_x = target_x - BASKET_DIAMETER/2;
  let basket_y = target_y;
  let backboard_x = basket_x + (BASKET_DIAMETER + DIST_TO_BASKET);
  let backboard_y = basket_y - (BACKBOARD_HEIGHT - DIST_TO_BASKET - 2);
  let post_x = backboard_x + BACKBOARD_THICK + 2;
  let post_y = backboard_y + BACKBOARD_HEIGHT/2;
  let post_height = BACKBOARD_HEIGHT/2 + BASKET_HEIGHT;
  
  fill(230, 150, 0);
  rect(basket_x, basket_y, BASKET_DIAMETER, BASKET_THICK);
  
  fill(200, 200, 200);
  rect(backboard_x, backboard_y, BACKBOARD_THICK, BACKBOARD_HEIGHT);
  
  fill(0, 0, 0);
  rect(post_x, post_y, POST_THICK, post_height);
}


/*
  Function to draw the trajectory
  
  *  theta = launch angle
  *  velocity = initial velocity
  *  start_x, start_y = coordinates of the robot
  *  end_x, end_y = coordinates of the hoop
*/
function draw_trajectory(theta, velocity, start_x, start_y, end_x, end_y) {
  let angle = radians(theta);
  let cos2 = cos(angle)*cos(angle);        // Cosine squared
  let v2 = velocity*velocity;              // Velocity squared
  
  let dist_x = end_x - start_x;            // Displacement in the x direction
  let dist_y = end_y - start_y;            // Displacement in the y direction
  
  noFill();
  stroke(5);
  translate(start_x, start_y);            // Translate the origin to the robot
  
  // Draw a new shape (trajectory shape)
  beginShape();
    // If the angle is above 84 degrees, draw a simple line
    if (theta > 86) {
      line(0, 0, dist_x, dist_y);
    }
    // Otherwise, draw a parabola
    else {
      curveVertex(0, 0);                                      // Origin coordinate
      
      // Loop through all points in the parabola
      for (let x = 1; x <= dist_x; x++) {
        let y = -(x*tan(angle) - (G*(x*x))/(2*v2*cos2));      // Calculate the y coordinate using the trajectory displacement equation
        curveVertex(x, y);                                    // Add a point to the parabola
      }
    }
  endShape();
}


/*
  Setup Function
*/
function setup() {
  createCanvas(640, 640);
  hoop_x = width/2 + 100;              // Set the x coordinate of the hoop
  hoop_y = height - BASKET_HEIGHT;     // Set the y coordinate of the hoop
  textSize(FONT_SIZE);                 // Set the size of the fonts
  
  /* Setup slider for adjusting the scale factor */
  scale_slider = createSlider(10, 1000, 100, 10);
  scale_slider.size(100);
  scale_slider.position((width - 200), FONT_SIZE*2);
  
  /* Setup for adjusting the angle rate of change */
  angle_rate_slider = createSlider(0.25, 1.5, 0.5, 0.01);
  angle_rate_slider.size(100);
  angle_rate_slider.position((width - 200), FONT_SIZE*5);
}


/*
  Draw Function
*/
function draw() {
   let x = 0; 
  
   clear();
   noStroke();
   
   scale = scale_slider.value();
   angle_rate = angle_rate_slider.value();
   
   draw_hoop(hoop_x, hoop_y);
   
   fill(255, 0, 0);
   ellipse(hoop_x, hoop_y, BALL_SIZE, BALL_SIZE);
   
   fill(0, 0, 255);
   if (mouseX < hoop_x - MAX_DIST) {
     ellipse(mouseX, height - ROBOT_SIZE/2, ROBOT_SIZE, ROBOT_SIZE);
     x = mouseX;
   }
   else {
     ellipse(hoop_x - MAX_DIST, height - ROBOT_SIZE/2, ROBOT_SIZE, ROBOT_SIZE);
     x = hoop_x - MAX_DIST;
   }
   
   let theta = calc_theta(x, hoop_x, angle_rate);
   let velocity = calc_velocity(theta, x, (height - ROBOT_SIZE/2), hoop_x, hoop_y);
   let velocity_scaled = calc_velocity(theta, x/scale, (height - ROBOT_SIZE/2)/scale, hoop_x/scale, hoop_y/scale);
   
   fill(150, 150, 150);
   text("Launch Angle = " + nfc(theta, 2) + " deg", 10, FONT_SIZE);
   text("Launch Velocity = " + nfc(velocity_scaled, 2) + " m/s", 10, FONT_SIZE*2);
   text("Distance to Hoop = " + nfc((hoop_x - x)/scale, 2) + " m", 10, FONT_SIZE*3);
   text("Height of the Hoop = " + nfc((height - hoop_y)/scale, 2) + " m", 10, FONT_SIZE*4);
   text("SCALE: " + scale, width - 200, FONT_SIZE);
   text("ANGLE RATE: " + nfc(angle_rate, 2), width - 200, FONT_SIZE*4);
   console.log(angle_rate);
   
   draw_trajectory(theta, velocity, x, (height - ROBOT_SIZE/2), hoop_x, hoop_y);
}
