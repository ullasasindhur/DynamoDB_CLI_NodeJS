#! /usr/bin/env node
const { Command } = require("commander");
const program = new Command();
const inquirer = require("inquirer");
const { apiCall } = require("../constants/apiCalls");
const Table = require("cli-table");
const table = new Table({
  chars: {
    top: "═",
    "top-mid": "╤",
    "top-left": "╔",
    "top-right": "╗",
    bottom: "═",
    "bottom-mid": "╧",
    "bottom-left": "╚",
    "bottom-right": "╝",
    left: "║",
    "left-mid": "╟",
    mid: "─",
    "mid-mid": "┼",
    right: "║",
    "right-mid": "╢",
    middle: "│",
  },
});
const { inputData } = require("../constants/input");
const colors = require("colors/safe");
const Validate = require("../constants/auth");

//version
program.version("1.0.0");

//Table commands
program
  .command("create-table")
  .argument("<secret>", "Enter Secret Pin for authentication")
  .description("Create a new Movies Table")
  .action((secret) => {
    Validate.authFunction(secret);
    apiCall("POST", "/table/create");
  });
program
  .command("delete-table")
  .argument("<secret>", "Enter Secret Pin for authentication")
  .description("Delete Movies table")
  .action((secret) => {
    Validate.authFunction(secret);
    apiCall("DELETE", "/table/delete");
  });
program
  .command("load-table")
  .argument("<secret>", "Enter Secret Pin for authentication")
  .description("load Movies table with default data")
  .action((secret) => {
    Validate.authFunction(secret);
    apiCall("POST", "/table/load");
  });
program
  .command("get-all")
  .argument("<secret>", "Enter Secret Pin for authentication")
  .description("Get all items in the table")
  .action((secret) => {
    Validate.authFunction(secret);
    apiCall("GET", "/table/getall");
  });

//Item Commands
program
  .command("add-item")
  .argument("<secret>", "Enter Secret Pin for authentication")
  .description("Add item to the table movies")
  .action((secret) => {
    Validate.authFunction(secret);
    inquirer.prompt(inputData.slice(0, 4)).then((answers) => {
      apiCall(
        "POST",
        `/item/add/${answers.year}&${answers.title}&${answers.plot}&${answers.rating}`
      );
    });
  });
program
  .command("read-item")
  .argument("<secret>", "Enter Secret Pin for authentication")
  .description("Read item from the table movies")
  .action((secret) => {
    Validate.authFunction(secret);
    inquirer.prompt(inputData.slice(0, 2)).then((answers) => {
      apiCall("GET", `/item/read/${answers.year}&${answers.title}`);
    });
  });
program
  .command("update-item")
  .argument("<secret>", "Enter Secret Pin for authentication")
  .description("Update existing item in the table movies")
  .action((secret) => {
    Validate.authFunction(secret);
    inquirer.prompt(inputData.slice(0, 5)).then((answers) => {
      apiCall(
        "PATCH",
        `/item/update/${answers.year}&${answers.title}&${answers.plot}&${answers.rating}&${answers.actors}`
      );
    });
  });
program
  .command("remove-item")
  .argument("<secret>", "Enter Secret Pin for authentication")
  .description("Remove item in the table movies")
  .action((secret) => {
    Validate.authFunction(secret);
    inquirer.prompt(inputData.slice(0, 2)).then((answers) => {
      apiCall("DELETE", `/item/remove/${answers.year}&${answers.title}`);
    });
  });
program
  .command("remove-item")
  .argument("<secret>", "Enter Secret Pin for authentication")
  .description("Remove item in the table movies")
  .action((secret) => {
    Validate.authFunction(secret);
    inquirer.prompt(inputData.slice(0, 2)).then((answers) => {
      apiCall("DELETE", `/item/remove/${answers.year}&${answers.title}`);
    });
  });
//Additional Query Commands
program
  .command("contains")
  .argument("<secret>", "Enter Secret Pin for authentication")
  .description(
    "Check if there is any item contains entered value in the table movies"
  )
  .action((secret) => {
    Validate.authFunction(secret);
    inquirer.prompt(inputData.slice(5, 6)).then((answers) => {
      apiCall("GET", `/item/contains/${answers.string}`);
    });
  });
program
  .command("filter")
  .argument("<secret>", "Enter Secret Pin for authentication")
  .description("Get all movies in the table with given genre")
  .action((secret) => {
    Validate.authFunction(secret);
    inquirer.prompt(inputData.slice(7, 8)).then((answers) => {
      apiCall("GET", `/item/filter/${answers.genre}`);
    });
  });
program
  .command("starts")
  .argument("<secret>", "Enter Secret Pin for authentication")
  .description(
    "Check if there is any item starts with entered value in the table movies"
  )
  .action((secret) => {
    Validate.authFunction(secret);
    inquirer.prompt(inputData.slice(5, 7)).then((answers) => {
      apiCall("GET", `/item/starts/${answers.string}&${answers.number}`);
    });
  });
program
  .command("equals")
  .argument("<secret>", "Enter Secret Pin for authentication")
  .option("-y, --year [year]", "Enter the year you want to search")
  .description(
    "Check if there is any item equals entered value in the table movies"
  )
  .action((secret, options) => {
    Validate.authFunction(secret);
    if (options.year) {
      apiCall("GET", `/item/equals/${options.year}`);
    } else {
      inquirer.prompt(inputData.slice(0, 1)).then((answers) => {
        apiCall("GET", `/item/equals/${answers.year}`);
      });
    }
  });

//options
program.option(
  "-f, --format [format]",
  "See the Responses in JSON/TABLE Format",
  "json"
);

program.option("-d, --debug", "See the Responses in Debug Mode");

program.parse(process.argv);

const options = program.opts();

//Output Messages
exports.successMessage = (response) => {
  if (options.debug) {
    console.log(colors.yellow(response));
  } else if (options.format.toLowerCase() == "table") {
    const route = response.data.route;
    switch (route) {
      case "/item/read":
        readOutput(response);
        break;
      case "/item/contains":
        tableOutput(response);
        break;
      case "/item/filter":
        tableOutput(response);
        break;
      case "/item/equals":
        tableOutput(response);
        break;
      case "/item/starts":
        tableOutput(response);
        break;
      case "/table/getall":
        getAll(response);
      default:
        jsonOutput(response);
        break;
    }
  } else {
    jsonOutput(response);
  }
};

exports.errorMessage = (error) => {
  if (options.debug) {
    console.log(colors.red(error));
  } else {
    console.log(colors.red(error.config));
  }
};

function tableOutput(response) {
  const contain = response.data.data;
  table.push(["Title", "Year", "Rating", "Actors"]);
  contain.Items.map((element) => {
    table.push([
      `${element.title} `,
      `${element.year} `,
      `${element.info.rating}`,
      `${element.info.actors} `,
    ]);
  });
  console.log(colors.magenta.bold(table.toString()));
  console.log(
    colors.rainbow(`Number of items matched query: ${contain.Count}`)
  );
}

function getAll(response) {
  const contain = response.data.data;
  table.push(["Title", "Year"]);
  contain.Items.map((element) => {
    table.push([`${element.title.S} `, `${element.year.N} `]);
  });
  console.log(colors.magenta.bold(table.toString()));
  console.log(
    colors.rainbow(`Number of items matched query: ${contain.Count}`)
  );
  process.exit(0);
}

function readOutput(response) {
  const read = response.data.data.Item;
  if (read == undefined) {
    console.log(colors.red("Item doesn't exists"));
  } else {
    table.push(
      { Title: read.title },
      { Year: read.year },
      { Rating: read.info.rating },
      { Plot: read.info.plot }
    );
    console.log(colors.magenta.bold(table.toString()));
  }
}

function jsonOutput(response) {
  if (response.data.route.includes("table")) {
    if (response.data.message.includes("Sorry")) {
      console.log(colors.red(response.data.error));
    } else if (response.data.route == "/table/getall") {
      console.log(colors.cyan(response.data.data));
    } else {
      console.log(colors.cyan(response.data.details));
    }
  } else {
    if (response.data.message.includes("Sorry")) {
      console.log(colors.red(response.data));
    } else if (response.data.route == "/item/read") {
      if (response.data.data.Item != undefined) {
        console.log(colors.cyan(response.data.data.Item));
      } else {
        console.log(colors.red("Sorry, Data doesn't exists"));
      }
    } else {
      if (response.data.data.Items != undefined) {
        console.log(colors.cyan(response.data.data.Items));
      } else {
        console.log(colors.cyan(response.data));
      }
    }
  }
}
