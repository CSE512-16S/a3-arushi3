# Plotting Time Series Data From Protein Simulations Using Time Curves   
Inspired by a recent paper about [Time Curves](http://www.aviz.fr/~bbach/timecurves/), I made an interactive visualization to study data derived from protein folding simulations in my research lab. The motive of this project is to understand distributions in variables and correlations between variables that are not apparent in simple line graphs of variables changing over time. This can also be a replacement to watching protein simulation movies where keeping note of several changing variables at the same time can be a formidable task.  
  
The time series data - usually energy, length of protein, distance from reference particle - is uploaded to the plotting engine. Each data point is placed on the plot at some relative distance to other points depending on their closeness with respect to a set of variables. For example, when we plot energy, two points with similar energy are plotted close together. When we plot Energy & Distance, two points with a similar combination of both variables are near each other. The line color tells the reader if the event occurs earlier or later in time - light colors for earlier time. Similar points are colored in the same color to make the graph easily readable. There are *five* main forms of interaction:  
  
* Tooltip with information about data at each point  
* Paths that highlight and get arrows that show you how points are moving in time  
* Zoom in and out using touch pad or scroll
* Dragging the figure when zoomed in or out to see the points better
* Options to plot 1,2 or 3 variables in this space  
  
