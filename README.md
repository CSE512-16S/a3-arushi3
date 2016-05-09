# Plotting Time Series Data From Protein Simulations Using Time Curves   
Inspired by a recent paper about [Time Curves](http://www.aviz.fr/~bbach/timecurves/), I made an interactive visualization to study data derived from protein folding simulations in my research lab. The motive of this project is to understand distributions in variables and correlations between variables that are not apparent in simple line graphs of variables changing over time. This can also be a replacement to watching protein simulation movies where keeping note of several changing variables at the same time can be a formidable task.  (You can access the final visualization [here](http://cse512-16s.github.io/a3-arushi3/) )
  
The time series data - usually energy, length of protein, distance from reference particle - is uploaded to the plotting engine. Each data point is placed on the plot at some relative distance to other points depending on their closeness with respect to a set of variables. For example, when we plot energy, two points with similar energy are plotted close together. When we plot Energy & Distance, two points with a similar combination of both variables are near each other. The line color tells the reader if the event occurs earlier or later in time - light colors for earlier time. Similar points are colored in the same color to make the graph easily readable. There are **six main forms of interaction**:  
  
* Information about each data point as you bring your mouse over   
* Paths highlight and show you their direction when you bring your mouse over  
* Zoom in and out using the touchpad or scroll keys   
* Drag the figure to focus on the areas of interest  
* Radio buttons to select number of variables for plotting   
* Drop down menus to select the variables of interest  
  
<img src="lib/screencapture.PNG" width="500" height="600">
  
## Data Domain  
  This data come from a protein simulation - 4 LK-alpha 14 proteins (shown below) in water (not shown). The size of the proteins (radius of gyration), inter-protein distances, energy and other association parameters have been tracked during the simulation. This data usually fluctuates (a lot) within a range and occasionally jumps to a new state or value. Fluctuations capture the stability of the system and jumps are important to track rare-events in the simulations.  
  <img src="lib/protein_image.png" width="500" height="500">  
  
## Reason for Choosing Time Curves  
I liked the concept of Time Curves introduced in class by Professor Heer and later read the method from [the site](http://www.aviz.fr/~bbach/timecurves/). Since the protein variables are tracked over time, I felt that this could be a good option. I believe they are better than simple line graphs since it's easier to see clusters and outliers over the entire time range. It is common in our field to use [VMD](http://www.ks.uiuc.edu/Research/vmd/) to visualize the simulation in 3D and see how the protein is evolving. It is difficult to monitor numerous variables at the same time and very difficult to keep track of similarities/differences between two time steps.  

## Storyboard  
