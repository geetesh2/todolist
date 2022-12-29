//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); 
const _ = require("lodash"); 
const app = express();

mongoose.set('strictQuery', true);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connection to database
mongoose.connect("mongodb+srv://geetesh:Test123@cluster0.j5rgb6r.mongodb.net/todolist",{useNewUrlParser:true});

//Defining the schema
const itemschema = mongoose.Schema({
    name : String
});

//building the model
const Item = mongoose.model("Item",itemschema);

//1st task
const wakeup = new Item({
  name : "welcome to your todolist!"
});

const Brush = new Item({
  name : "Hit the + button to add a new item"
});

const Bath = new Item({
  name : "<-- Hit this button to delete"
});

const listSchema = {
  name:String,
  items: [itemschema]
};

const defaultItems = [wakeup,Brush,Bath];
const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,response){
    if(response.length === 0)
    {
      const defaultItems = [wakeup,Brush,Bath];
      Item.insertMany(defaultItems,(err)=>{
        if(err){
          console.log(err);
        } else{
          console.log("chnages saved succesfuly");
        }
      });
      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: response});
      }

  });

});



app.get("/:customlistname",(req,res)=>{
  const customListName = _.capitalize(req.params.customlistname);
  List.findOne({name:customListName},(err,result)=>{
    if(!err)
    {
      if(!result)
      {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);

      }
      else
      {
        if(customListName != 'favicon.io')
        {
          res.render("list",{listTitle: result.name,newListItems:result.items})

        }
      }
    
    }
  });
});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listname = req.body.list;
  const newtask = new Item({ 
    name : item,
  });
  if(listname === "Today")
  {
    newtask.save();
    res.redirect("/");

  } else {
    List.findOne({name:listname},(err,foundList)=>{
      foundList.items.push(newtask);
      foundList.save();
      res.redirect("/"+listname);
    })
  }

});

app.post("/delete",(req,res)=>{
  const checkeditemid = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkeditemid,(err)=>{
      if(err){
        console.log(err);
      } else{
        console.log("Item deleted");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkeditemid } }},(err,foundlist)=>{
      if(!err)
      {
         res.redirect("/"+listName);
      }
    });
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(80, function() {
  console.log("Server started");
});
