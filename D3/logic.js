 var source;
 $.getJSON('gtm.json', function(response) {
     source = response;
     $(window).trigger('JSONready');
     //console.log(source);
 })

 var tagTypeMap ={
    'ua' : 'Google Analytics',
    'fb' : 'Facebook',
    'html' : 'Custom HTML',
    'img' : 'Image',
    'awct' : 'Adwords Conversion Tracking',
    'flc' : 'DoubleClick Floodlight Counter',
    'fsl' : 'Form Submit Listener',
    'jel' : 'JavaScript Error Listener',
    'lcl' : 'Link Click Listener',
    'csm' : 'ComScore',
    'sp' : 'AdWords Remarketing'

 }

 $(window).on('JSONready', function() {

     console.log(source);
     var tagData = [],
         tagtypeChildren=[],
         tagTypes = [],
         tempObj=[];
     
     source.containerVersion.tag.forEach(function(element) {
         const picked = (({type,name}) => ({ type,name}))(element);
         tagData.push(picked);
     });

     console.log(tagData.length);
     tagTypes= tagData.map(item => item.type)
                     .filter((value, index, self) => self.indexOf(value) === index);

     console.log(tagTypes);

     tagTypes.forEach(function(type){
            tagData.forEach(function(tag) {
                 if(tag.type === type){
                    const child ={
                        'name' : tag.name,
                        'chnildren' : null
                    }
                   tempObj.push(child);   
                } 
           
         });
         tagtypeChildren.push({
             'name' : tagTypeMap[type],
             children: tempObj
         });
         tempObj=[];   
     })



     

     var treeData = [{
         "name": source.containerVersion.container.publicId,
         "parent": "null",
         "children": [

             { //Start tag 
                 "name": "Tags",
                 "children": tagtypeChildren
             } //End tag 


             // { //Start Variables 
             //     "name": "Variables",
             //     "children": [{
             //             "name": "Custom Variables",
             //             "children": source.containerVersion.variable
             //         },
             //         {
             //             "name": "builtInVariable",
             //             "children": source.containerVersion.builtInVariable
             //         }
             //     ] //End Vaiable Children
             // }, // End Variable


             // { // Start Triggers
             //     "name": "Triggers",
             //     "children": source.containerVersion.trigger
             // }

         ] //End GTM children
     }];

     // D3 code not to be touched as of now
     var margin = {
             top: 20,
             right: 120,
             bottom: 20,
             left: 120
         },
         width = 2000 - margin.right - margin.left,
         height = (tagData.length > 400) ? 2000 - margin.top - margin.bottom : 500 - margin.top - margin.bottom;

     var i = 0,
         duration = 750,
         root;

     var tree = d3.layout.tree()
         .size([height, width]);

     var diagonal = d3.svg.diagonal()
         .projection(function(d) {
             return [d.y, d.x];
         });

     var svg = d3.select("body").append("svg")
         .attr("width", width + margin.right + margin.left)
         .attr("height", height + margin.top + margin.bottom)
         .append("g")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     root = treeData[0];
     root.x0 = height / 2;
     root.y0 = 0;
     function collapse(d) {
     if (d.children) {
          d._children = d.children;
          d._children.forEach(collapse);
          d.children = null;
        }
      }

    root.children.forEach(collapse);

     update(root);

     d3.select(self.frameElement).style("height", "10000px");

     function update(source) {

         // Compute the new tree layout.
         var nodes = tree.nodes(root).reverse(),
             links = tree.links(nodes);

         // Normalize for fixed-depth.
         nodes.forEach(function(d) {
             d.y = d.depth * 180;
         });

         // Update the nodes…
         var node = svg.selectAll("g.node")
             .data(nodes, function(d) {
                 return d.id || (d.id = ++i);
             });

         // Enter any new nodes at the parent's previous position.
         var nodeEnter = node.enter().append("g")
             .attr("class", "node")
             .attr("transform", function(d) {
                 return "translate(" + source.y0 + "," + source.x0 + ")";
             })
             .on("click", click);

         nodeEnter.append("circle")
             .attr("r", 1e-6)
             .style("fill", function(d) {
                 return d._children ? "lightsteelblue" : "#fff";
             });

         nodeEnter.append("text")
             .attr("x", function(d) {
                 return d.children || d._children ? -13 : 13;
             })
             .attr("dy", ".35em")
             //.attr("dy", function(d) { return d.children || d._children ? "-.75em" : ".35em"; })
             .attr("text-anchor", function(d) {
                 return d.children || d._children ? "end" : "start";
             })
             .text(function(d) {
                 return d.name;
             })
             .style("fill-opacity", 1e-6);

         // Transition nodes to their new position.
         var nodeUpdate = node.transition()
             .duration(duration)
             .attr("transform", function(d) {
                 return "translate(" + d.y + "," + d.x + ")";
             });

         nodeUpdate.select("circle")
             .attr("r", 10)
             .style("fill", function(d) {
                 return d._children ? "lightsteelblue" : "#fff";
             });

         nodeUpdate.select("text")
             .style("fill-opacity", 1);

         // Transition exiting nodes to the parent's new position.
         var nodeExit = node.exit().transition()
             .duration(duration)
             .attr("transform", function(d) {
                 return "translate(" + source.y + "," + source.x + ")";
             })
             .remove();

         nodeExit.select("circle")
             .attr("r", 1e-6);

         nodeExit.select("text")
             .style("fill-opacity", 1e-6);

         // Update the links…
         var link = svg.selectAll("path.link")
             .data(links, function(d) {
                 return d.target.id;
             });

         // Enter any new links at the parent's previous position.
         link.enter().insert("path", "g")
             .attr("class", "link")
             .attr("d", function(d) {
                 var o = {
                     x: source.x0,
                     y: source.y0
                 };
                 return diagonal({
                     source: o,
                     target: o
                 });
             });

         // Transition links to their new position.
         link.transition()
             .duration(duration)
             .attr("d", diagonal);

         // Transition exiting nodes to the parent's new position.
         link.exit().transition()
             .duration(duration)
             .attr("d", function(d) {
                 var o = {
                     x: source.x,
                     y: source.y
                 };
                 return diagonal({
                     source: o,
                     target: o
                 });
             })
             .remove();

         // Stash the old positions for transition.
         nodes.forEach(function(d) {
             d.x0 = d.x;
             d.y0 = d.y;
         });
         link.exit();
     }

     // Toggle children on click.
     function click(d) {
         if (d.children) {
             d._children = d.children;
             d.children = null;
         } else {
             d.children = d._children;
             d._children = null;
         }
         update(d);
     }

 })