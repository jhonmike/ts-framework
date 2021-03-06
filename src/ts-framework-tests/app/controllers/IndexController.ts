import {Request, Response, HttpController, action} from "../../../ts-framework/Http";
import {ContentResult} from "../../../ts-framework/View";
import {controller} from "../../../ts-framework/Controller/ControllerDecorator";

@controller()
export class IndexController extends HttpController
{
    // GET: /
    @action()
    public index()
    {
        return this.content(`
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>TS-Framework</title>

                    <style type="text/css">
                        body {
                            font-family: 'Open Sans', sans-serif;
                            text-align: center;
                            font-weight: 400;
                            margin: 0;
                            color: #333;
                        }
                        a,
                        a:visited {
                            color: #1E90FF;
                        }
                        header {
                            position: absolute;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        header h1 {
                            width: 100%;
                            font-weight: 800;
                            font-size: 5rem;
                            margin: 0;
                            margin-top: -125px;
                        }
                        header p {
                            display: block;
                            width: 100%;
                            border-top: 1px solid #ddd;
                            padding-top: 20px;
                            margin-top: 0px;
                        }
                        footer {
                            position: absolute;
                            font-size: small;
                            bottom: 0;
                            width: 100%;
                            margin: 0;
                            color: #999;
                        }
                        header p code {
                            color: #c7254e;
                            background-color: #f9f2f4;
                            padding: 4px;
                            border-radius: 2px;
                        }
                        footer a {
                            color: #59ADFF;
                        }
                    </style>
                    <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,800" rel="stylesheet" type="text/css" />
                </head>
                <body>
                    <header>
                        <section>
                            <h1>TS-Framework</h1>
                            <p>
                                Awesome, you're running your first TS-Framework application! <br />
                                You're currently looking at <code>IndexController#index()</code>
                            </p>
                        </section>
                    </header>

                    <footer>
                        <p>Powered by <a href="https://github.com/tsframework">TS-Framework</a></p>
                    </footer>
                </body>
            </html>
        `);
    }
}