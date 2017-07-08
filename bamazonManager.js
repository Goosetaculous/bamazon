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
        userPrompt()
    }
})

function userPrompt(){
    console.log("WELCOME TO BAMAZON Manager!")
    var questions = [
        {
            name: 'task',
            message: 'Choose a task',
            type: 'list',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
        }
    ]
    inquirer.prompt(questions).then((choices)=>{
        switch(choices.task) {
            case 'View Products for Sale':
                queryInventory(null,userPrompt)
                break;
            case 'View Low Inventory':
                queryInventory(true,userPrompt)
                break;
            case 'Add to Inventory':
                addInventoryPrompt()
                break;
            case 'Add New Product':
                addProductPrompt()
                break;
        }
    });
}

function addProductPrompt(){
    var questions = [
        {
            name: 'productName',
            message: 'Whats the name of the product?',
            type: 'input'
        },
        {
            name: 'departmentName',
            message: 'Whats the Department Name of the product?',
            type: 'input'
        },
        {
            name: 'price',
            message: 'Whats the price of the product?',
            type: 'input',
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
            name: 'stockQuantity',
            message: 'Whats the stock quantity of the product?',
            type: 'input',
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
        console.log(answers)
        insertProduct(  answers.productName,
                        answers.departmentName,
                        answers.price,
                        answers.stockQuantity
                    )

    })

}

function addInventoryPrompt(){
    var questions = [
        {
            name: 'id',
            message: 'Which id do you want to add inventory?',
            type: 'input',
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
            name: 'qty',
            message: 'How many do you want to add?',
            type: 'input',
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
    inquirer.prompt(questions).then((choices)=>{
        checkInventory(  parseInt(choices.id.trim()) ,null,(thereIs)=>{
            if(thereIs.stock){
                updateInventory(parseInt(choices.id.trim()) , parseInt(choices.qty.trim()) + thereIs.inventory )
            }else{
                console.log("Invalid Item CHOOSE ANOTHER ITEM.")
                addInventoryPrompt()
            }
        })
    })
}

function insertProduct(productName,departmentName,price,stockQuantity){
    connection.query('INSERT into products  (product_name,department_name,price,stock_quantity) values(?,?,?,?)', [productName,departmentName,price,stockQuantity], function (error, results, fields) {
        if (error) throw error;
        console.log("\nNew inventory for the the store")
        queryInventory(false,userPrompt)
    });

}

function updateInventory(id,newInventory){
    connection.query('UPDATE products SET stock_quantity = ? WHERE item_id = ?', [newInventory,id], function (error, results, fields) {
        if (error) throw error;
        console.log("\nNew inventory for the the store")
        queryInventory(false,userPrompt)
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
            callback(obj)
        }else{
            callback(obj)
        }
    });
}

function queryInventory(low,callback){
    let where = ""
    low ? where = "WHERE stock_quantity < 5" : null
    connection.query("SELECT * FROM products "+ where, function (error, results, fields) {
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
