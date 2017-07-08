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
    console.log("WELCOME TO BAMAZON Supervisor!")
    var questions = [
        {
            name: 'task',
            message: 'Choose a task',
            type: 'list',
            choices: ['View Product Sales by Department', 'Create New Department']
        }
    ]
    inquirer.prompt(questions).then((choices)=>{
        switch(choices.task) {
            case 'View Product Sales by Department':
                productSales(userPrompt)
                break;
            case 'Create New Department':
                addDepartmentPrompt()
                break;

        }
    });
}

function addDepartmentPrompt(){
    var questions = [
        {
            name: 'depName',
            message: 'What is the Department Name?',
            type: 'input'
        },

        {
            name: 'depCost',
            message: 'Whats is Department cost?',
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
        insertDepartment(  answers.depName, answers.depCost )
    })
}



function insertDepartment(depName,depCosts){
    connection.query('INSERT into departments  (department_name,over_head_costs) values(?,?)', [depName,depCosts], function (error, results, fields) {
        if (error) throw error;
        console.log("\nNew department added. Here's the new report")
        productSales(userPrompt)
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

function productSales(callback){
    let query ="SELECT " +
        "dp.department_id as depId," +
        "dp.department_name as depName," +
        "dp.over_head_costs as overHeadcost," +
        "p.product_sales as productSales," +
        "p.product_sales - over_head_costs as profit " +
        "FROM departments AS dp " +
        "LEFT JOIN products p ON p.department_name = dp.department_name GROUP BY dp.department_name"
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        displayResults(results)
        callback ? callback():null
    });
}


function displayResults(results){
    var table = new Table({
        head: ['department_id','department_name', 'over_head_costs','product_sales','total_profit']
        , colWidths: [5, 35,20,20,20]
    });
    results.forEach(function(elem){
        table.push(
            [elem.depId, elem.depName,elem.overHeadcost,elem.productSales,elem.profit]
        );
    })
    console.log('\n'+table.toString());
}
