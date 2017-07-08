/**
 * Created by goosetaculous on 7/7/17.
 */
var inquirer   =  require('inquirer')
var mysql      =  require('mysql')
var credentials =  require('./connection')
var Table = require('cli-table');
var connection =  mysql.createConnection(credentials.con)

//INITIALIZE THE CONNECTION
connection.connect((err)=>{
    if(err){
        console.log('error connecting: '+ err)
    }else {
        queryInventory(null,userPrompt)
    }
})

function userPrompt(){
    console.log("WELCOME TO BAMAZON!")
    var questions = [
        {
        name: 'productid',
        type: 'input',
        message: 'Which product id you want to buy? ',
        validate: function(value){
            if (! /^[0-9]/.test(value)) {
                console.log("\nPlease put a numeric value\n");
                return false;
            }else{
                return true;
            }
            }
        },
        {
            name: 'units',
            type: 'input',
            message: 'How many units would you like to buy? ',
            validate: function(value){
                if (! /^[0-9]/.test(value)) {
                    console.log("\nPlease put a numeric value\n");
                    return false;

                }else{
                    return true;
                }
            }
        }
        ]
    inquirer.prompt(questions).then((answers)=>{
        checkInventory(  parseInt(answers.productid.trim())  ,null,(thereIs)=>{
            if(thereIs.stock){
                processTransaction(parseInt(answers.productid.trim()),parseInt(answers.units.trim()))
            }else{
                console.log("Invalid Item CHOOSE ANOTHER ITEM.  I'll ask the manager")
                userPrompt()
            }
        })

    });
}



function processTransaction(id,items){
    checkInventory(id,items,(thereIs)=>{
        if(thereIs.stock){
            console.log(`\nYou card is charged with $${thereIs.price * items} for ${items} ${thereIs.name} `)
            updateInventory(id,thereIs.inventory-items, thereIs.sales +(thereIs.price * items) )
        }else{
            console.log("Insufficient quantity! ")
        }
    })
}

function updateInventory(id,newInventory,sales){
    connection.query('UPDATE products SET stock_quantity = ?,product_sales = ? WHERE item_id = ?', [newInventory,sales,id], function (error, results, fields) {
        if (error) throw error;
        console.log("\nNew inventory for this item in the store")
        queryInventory(id)
    });
}


function checkInventory(id,items,callback){
    connection.query("SELECT * FROM products WHERE item_id =?",[id],  (error, results, fields)=> {
        if (error) throw error;
        let obj={}
        if (callback && results.length > 0){
                obj.inventory = results[0].stock_quantity
                obj.stock = results[0].stock_quantity >= items? true:false
                obj.price = results[0].price
                obj.name  = results[0].product_name
                obj.sales = results[0].product_sales
            callback(obj)
        }else{
            callback(obj)
        }
    });
}

function queryInventory(item,callback){
    let where = ""
    item ? where = "WHERE item_id like '%?'" : null
    connection.query("SELECT * FROM products "+ where,[item], function (error, results, fields) {
        if (error) throw error;
        displayResults(results)
        callback ? callback():null
    });
}


function displayResults(results){
    var table = new Table({
        head: ['ID','Product Name', 'Department Name','Price','Stock Quantity']
        , colWidths: [5, 35,20,20,20]
    });
    results.forEach(function(elem){
        table.push(
            [elem.item_id, elem.product_name,elem.department_name,elem.price,elem.stock_quantity]
        );
    })
    console.log('\n'+table.toString());
}
