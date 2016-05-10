/// <reference path="../../../typings/main.d.ts" />
/// <reference path="../../../node_modules/huject/huject.d.ts" />

import * as Express from "express";
import { Container } from 'huject'
import { AutoLoader } from "./AutoLoader";
import { Configuration } from "./Configuration";

/**
 * TS-Framework application
 * This class is a wrapper around the default express server
 * It will load controllers, models and routes automatically
 */
export class Application
{
    /**
     * Default port used by the application in development mode
     * @type {number}
     */
    public static DEFAULT_PORT = 3000;

    /**
     * AutoLoader object
     * @type {AutoLoader}
     */
    private loader: AutoLoader;

    /**
     * Configuration object
     * @type {Configuration}
     */
    private config: Configuration;

    /**
     * Express server we're creating a wrapper for
     * @type {Express.Application}
     */
    private express: Express.Application;

    /**
     * Injection of dependencies container
     * @type {Huject.Container}
     */
    private container = new Container();


    /**
     * Application constructor
     * Developer must define the default root directory of the application
     * @param {string} rootDirectory
     * @param {string[]} serviceProviders
     */
    public constructor(private rootDirectory: string, private serviceProviders: string[])
    {
        // Print a pretty header
        this.printHeader();

        // Initialize router and configuration manager
        this.container = new Container();

        //Bind all service providers to the autoloader
        this.loader = new AutoLoader(this, this.container);
        serviceProviders.forEach(serviceProvider => {
            this.loader.addServiceProvider(serviceProvider);
        });

        //Boot each services. They are registered to the container after this line
        this.loader.load();
        this.loader.boot();

        //Load config and router from container
        this.config = this.container.resolve("Configuration");

        // Define some default settings
        //TODO move that to some json files
        this.config.set('env', Application.getEnvironment());
        this.config.set('port', Application.DEFAULT_PORT);
        this.config.set('static.path', 'public');
        this.config.set('view.path', 'app/views');
        this.config.set('view.engine', 'ejs');
        this.config.set('view.layout', false);
    }

    /**
     * Checks wether the project should run as development mode or production mode
     * @returns {string}
     */
    public static getEnvironment()
    {
        return ((process.env.NODE_ENV == null) ? 'development' : process.env.NODE_ENV);
    }

    /**
     * Get the version specified in package.json
     * @returns {string|number}
     */
    private static getVersion()
    {
        return require('root-require')('package.json').version
    }

    /**
     * Gets the URL of the GitHub repository that belongs to the application
     * @returns {string}
     */
    private static getRepositoryAddress()
    {
        let repo = require('root-require')('package.json').repository.url;
            repo = repo.replace("git://", "https://");
            repo = repo.replace(".git", "");
        return String(repo);
    }

    /**
     * Registers all controllers and models accordingly, and starts the express server
     * @returns {void}
     */
    public start(): void
    {
        //Start each service. After this line the application is started and wait for requests
        this.loader.start();
    }

    /**
     * Prints out a pretty ASCII art header for the framework startup
     * @returns {void}
     */
    private printHeader(): void
    {
        console.log("-----------------------------------------------------------------------------     ");
        console.log("   ___________       ______                                             __        ");
        console.log("  /_  __/ ___/      / ____/________ _____ ___  ___ _      ______  _____/ /__      ");
        console.log("   / /  \\__ \\______/ /_  / ___/ __ `/ __ `__ \\/ _ \\ | /| / / __ \\/ ___/ //_/ ");
        console.log("  / /  ___/ /_____/ __/ / /  / /_/ / / / / / /  __/ |/ |/ / /_/ / /  / ,<         ");
        console.log(" /_/  /____/     /_/   /_/   \\__,_/_/ /_/ /_/\\___/|__/|__/\\____/_/  /_/|_|     ");
        console.log("                                                                                  ");
        console.log(" GitHub:  %s                                  ", Application.getRepositoryAddress());
        console.log(" Version: %s                                            ", Application.getVersion());
        console.log("-----------------------------------------------------------------------------     ");
    }
}
