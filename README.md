# Kryo

[![npm](https://img.shields.io/npm/v/kryo.svg?maxAge=2592000)](https://www.npmjs.com/package/kryo)
[![Build status](https://img.shields.io/travis/demurgos/kryo/master.svg?maxAge=2592000)](https://travis-ci.org/demurgos/kryo)
[![GitHub repository](https://img.shields.io/badge/Github-demurgos%2Fkryo-blue.svg)](https://github.com/demurgos/kryo)

https://demurgos.github.io/kryo/

## Description

Expressive extensible schemas.

## Install

````bash
npm install
gulp all:build
````

## API ##

### String ###

````ts
new StringType(options: DocumentOptions);
````

````ts
export interface StringOptions {
  regex?: RegExp; // null
  lowerCase?: boolean; // false
  trimmed?: boolean; // false
  minLength?: number; // null
  maxLength?: number; // null
  
  looseTest?: boolean; // false
}
````

`looseTest`: The test returns true if the only errors found can be fixed with .normalize.

#### .test(options: StringOptions) ####

Tests whether a string is valid or not according to the options.


### Document ###

````ts
new DocumentType(options: DocumentOptions);
````

Creates a new type to match against documents. This type ensures that the defined properties are set, enumerable and valid.

`DocumentOptions`:

* `properties: Dictionary<PropertyDescriptor>`: Each key is used as the property name and the associated behaviour is determined by the associated `PropertyDescriptor`. If the value is `null`, then the property is deleted (ignored) - usefull when extending the `DocumentOptions`.

    `PropertyDescriptor`:
    
    * `type: Type`: the type of the property (soon: If the type is `null` -> allow any value, requires manual read/write)
    
    * `optional: boolean`: Allows the value to be `null`
    
* `additionalProperties: boolean`: Allow (and ignore) additional properties when doing tests 

#### .diff ####

````ts
interface DiffResult {
    $set: Dictionary<jsonValues>;
    $update: Dictionary<Diff>;
    $unset: Dictionary<jsonValues>;
}
````
