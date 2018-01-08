(function() {
    tinymce.create("tinymce.plugins.green_button_plugin", {

        //url argument holds the absolute url of our plugin directory
        init : function(ed, url) {

            //add new button    
            ed.addButton("layouts", {
                text: "Layouts",
                title : "Add layout elements",
                cmd : "layouts_command",
                image : 'http://'+ window.location.host + "/wp-content/plugins/boardbest-editor/ico2.png"
            });

            ed.addButton("components", {
                text: "Components",
                title : "Add wordpress shortcodes from creator",
                cmd : "components_command",
                image : 'http://'+ window.location.host + "/wp-content/plugins/boardbest-editor/ico1.png"
            });

            ed.addButton("wp_media", {
                id: "insert-media-button",
                text: "Media",
                title : "Add media elements",
                cmd : "media_command",
                image : 'http://'+ window.location.host + "/wp-content/plugins/boardbest-editor/ico3.png"
            });

            //button functionality.
            ed.addCommand("media_command", function() {
/*              var selected_text = ed.selection.getContent();
                var return_text = "<span style='color: green'>" + selected_text + "</span>";
                ed.execCommand("mceInsertContent", 0, return_text);*/

                //https://wordpress.stackexchange.com/questions/251344/how-to-modify-wp-media-to-get-and-display-multiple-images
                var frame = wp.media({
                    multiple: true
                });
                frame.open();
                frame.on('select', function() {
                    var selection = frame.state().get('selection');
                    selection.each(function(attachment) {
                        console.log('att',attachment);
                        var out = '<img src="' + attachment.attributes.url + '" class="thumbnail" />';
                        ed.execCommand("mceInsertContent", 0, out)
                    });
                });
            });
            
            ed.addCommand("layouts_command", function() {
               // window.location.href = "#/templates/list/type=newsletter&callback=MCE";
                window.location.replace("#showmodal/a=sGETinit_layouts/active=addLayout/tpl=mainFormTemplate");
            });

            ed.addCommand("components_command", function() {
                //window.location.href = "#/shortcodes/simple"
                window.location.hash = "#showmodal/a=sGETinit_addshortcode/active=addShortcode/tpl=mainFormTemplate";
            });

        },

        createControl : function(n, cm) {
            return null;
        },

        /*getInfo : function() {
            return {
                longname : "Extra Buttons",
                author : "Narayan Prusty",
                version : "1"
            };
        }*/
    });

    tinymce.PluginManager.add("green_button_plugin", tinymce.plugins.green_button_plugin);
})();
