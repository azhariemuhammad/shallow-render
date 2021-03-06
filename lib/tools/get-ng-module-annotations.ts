import { NgModule, ModuleWithProviders, Type, Provider } from '@angular/core';
import { ngModuleResolver } from './reflect';

export interface NgModuleAnnotations extends NgModule {
  imports: (any[] | Type<any> | ModuleWithProviders)[];
  declarations: (any[] | Type<any>)[];
  providers: Provider[];
  exports: (Type<any> | any[])[];
  entryComponents: (any[] | Type<any>)[];
}

export function getNgModuleAnnotations(ngModule: Type<any>): NgModuleAnnotations {
  const {
    imports = [],
    providers = [],
    declarations = [],
    exports = [],
    entryComponents = [],
  } = ngModuleResolver.resolve(ngModule) || {};

  return {imports, providers, declarations, exports, entryComponents};
}
