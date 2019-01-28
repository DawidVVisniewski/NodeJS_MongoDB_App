var express =require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// ====================
// COMMENTS ROUTES
// ====================

//COMMENTS NEW 
router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn, function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

//COMMENTS CREATE 
router.post("/campgrounds/:id/comments", middleware.isLoggedIn, function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               req.flash("error", "Something went wrong");
               console.log(err);
           } else {
               //add username and id to comment 
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               campground.comments.push(comment);
               campground.save();
               //console.log(comment);
               req.flash("success", "Successfully added comment");
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });

});

//COMMENT EDIT ROUTE 
router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
       if(err){
       res.riderect("back");
       }else{
       res.render("comments/edit",{campground_id: req.params.id, comment:foundComment});
       }
   });
    
});

//COMMENT UPDATE ROUTE 
router.put("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    
  // res.send("am here can see it"); 
});

// COMMENT DESTROY ROUTE
router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //res.send("this is the destroy comment route");
    //findByIdAndRemove
     Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted");
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});


/*//MIDDLEWARE
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

function checkCommentOwnership(req, res, next){
    
    if(req.isAuthenticated()){
        
        Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        }else{
            //does user own the comment 
            if(foundComment.author.id.equals(req.user._id)){
            next();
            }else{
                res.redirect("back");
                  }
         }
       });
        }else{
        res.redirect("back");
    }
}*/

module.exports = router;
