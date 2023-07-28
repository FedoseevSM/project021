import camelCase from 'lodash/camelCase';
import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';

export function camelize(value: any): any {
  if (isPlainObject(value)) {
    return Object.keys(value).reduce((acc: { [key: string]: any }, key: string) => {
      acc[camelCase(key)] = camelize(value[key]);
      return acc;
    }, {})
  } else if (isArray(value)) {
    return value.map((elem) => camelize(elem));
  }
  return value;
}