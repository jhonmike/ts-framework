import * as Express from "express";

import {HttpServer} from "../HttpServer";
import {RouteCollection} from "./RouteCollection";
import {Route} from "./Route";
import {Request} from "../Request";
import {Response} from "../Response";
import {IActionResult} from "../../View/IActionResult";

import { Container, Inject } from 'huject'
import { ConfigurationContract } from "../../Core/Contracts/ConfigurationContract";
import {RouterContract} from "../../Core/Contracts/RouterContract";
import {DebugContract} from "../../Core/Contracts/DebugContract";

/**
 * Router script used to register and dispatch routes
 * Routes must be able to use /path/:id syntax
 */
export class Router implements RouterContract
{
    @Inject("HttpServer")
    private httpServer: HttpServer;

    @Inject("Container")
    private container: Container;

    @Inject("Configuration")
    private configuration: ConfigurationContract;

    @Inject("Debug")
    private debug: DebugContract;

    /**
     * All registered routes
     * @type {Array}
     */
    private routes: RouteCollection = {};

    /**
     * Create a get route
     * @param path
     * @param action
     */
    public get(path: string, action: string) {
        return this.route(['GET'], path, action);
    }

    /**
     * Create a post route
     * @param path
     * @param action
     * @returns {undefined}
     */
    public post(path: string, action: string) {
        return this.route(['POST'], path, action);
    }

    /**
     * Create a put route
     * @param path
     * @param action
     * @returns {undefined}
     */
    public put(path: string, action: string) {
        return this.route(['PUT'], path, action);
    }

    /**
     * Create a delete route
     * @param path
     * @param action
     * @returns {undefined}
     */
    public delete(path: string, action: string) {
        return this.route(['DELETE'], path, action);
    }

    /**
     * Create a patch route
     * @param path
     * @param action
     * @returns {undefined}
     */
    public patch(path: string, action: string) {
        return this.route(['PATCH'], path, action);
    }

    /**
     * Register a generic route
     * @param methods
     * @param path
     * @param action
     */
    public route(methods: string[], path:string, action: string) {
        let route = new Route();
        route.methods = methods;
        route.path = path;
        route.action = action;

        this.routes[path] = route;

        this.attachRouteToServer(route);

        // Debug message
        this.debug.__DEBUG(`Registered route: ${methods} ${path} to ${action}`);
    }

    /**
     * Attach route to express server
     * @param route
     */
    private attachRouteToServer(route: Route): void
    {
        route.methods.forEach(method => {
            var express = this.httpServer.getExpress();
            express[method.toLowerCase()](route.path, this.dispatch(route));
        });
    }

    /**
     * Method that actually handles a request
     * @returns {Function}
     */
    private dispatch(route: Route): Function
    {
        let container = this.container;
        let configuration = this.configuration;
        let debug = this.debug;

        return function (req: Express.Request, res: Express.Response, next: Function)
        {
            //Display framework version in debug mode
            if (configuration.get("debug")) {
                var tsfwVersion = configuration.get("tsfw-version");
                res.header("X-Powered-By", "TS-Framework "+tsfwVersion);
            } else {
                res.header("X-Powered-By", "TS-Framework");
            }


            // Request parameters don't match target?
            // Dispatch 404
            // else
            // Get parameters

            //Create a copy of the controller
            var controller = container.resolve(route.getController());

            //Set request and responce
            let request: Request = new Request(req);
            let response: Response = new Response(res);
            controller.__setRequest(request);
            controller.__setResponse(response);

            //Prepare the callback to actually send the result
            var send = (result: IActionResult) => {
                // IActionResult was returned, end the request
                if (
                    result !== undefined &&
                    result.__proto__.hasOwnProperty("execute") &&
                    result.execute instanceof Function
                ) {
                    result.execute(response);
                } else {
                    res.end();
                }

                //Log it
                debug.__DEBUG(`[${req.ip}] (${req.statusCode || 200}) ${req.method} ${req.path}`);
            };
            controller.__setSend(send);

            // Trigger the action
            controller[route.getMethod()]();
        }
    }
}
