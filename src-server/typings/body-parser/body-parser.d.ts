///<reference path="../express/express.d.ts"/>

declare module "body-parser" {
  import express = require('express');

  export interface IJSONOptions {
    strict?:boolean;
    inflate?:boolean;
    limit?:string;
    reviver?:any;
    type?:string;
    verify:(req?:express.Request, res?:express.Response, buf?:Buffer, encoding?:string)=>void;
  }

  export interface IRawOptions {
    inflate?:boolean;
    limit?:string;
    type?:string;
    verify:(req?:express.Request, res?:express.Response, buf?:Buffer, encoding?:string)=>void;
  }

  export interface ITextOptions {
    defaultCharset?:string;
    inflate?:boolean;
    limit?:string;
    type?:string;
    verify:(req?:express.Request, res?:express.Response, buf?:Buffer, encoding?:string)=>void;
  }

  export interface IURLEncodedOptions {
    extended:boolean;
    inflate?:boolean;
    limit?:string;
    parameterLimit?:number;
    type?:string;
    verify:(req?:express.Request, res?:express.Response, buf?:Buffer, encoding?:string)=>void;
  }

  export function json(options?:IJSONOptions);
  export function urlencoded(options?:IURLEncodedOptions)
  export function raw(options?:IRawOptions);
  export function text(options?:ITextOptions);
}