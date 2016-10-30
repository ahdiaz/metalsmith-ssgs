--- node_modules/metalsmith-permalinks/lib/index.js	2016-10-30 02:30:16.000000000 +0100
+++ node_modules/metalsmith-permalinks/lib/index.js	2016-10-30 02:30:37.000000000 +0100
@@ -115,6 +115,11 @@
   options.date = typeof options.date === 'string' ? format(options.date) : format('YYYY/MM/DD');
   options.relative = options.hasOwnProperty('relative') ? options.relative : true;
   options.linksets = options.linksets || [];
+  options.linksets = options.linksets.map(function(linkset) {
+    if (linkset.date && typeof(linkset.date === 'string'))
+      linkset.date = format(linkset.date);
+    return(linkset);
+  });
   return options;
 }

