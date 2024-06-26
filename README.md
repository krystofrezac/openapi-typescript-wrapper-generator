# openapi-typescript-wrapper-generator

Tool for generating typescript wrappers around generated code from [OpenAPI Generator](https://openapi-generator.tech/)

## Prerequisites

- Generate code with `openapi-generator` (set `useSingleRequestParameter` to `true`)

## Quick start

1. Create wrapper function and wrapper type. For example here is wrapper for [TanStack Query](https://tanstack.com/query/latest):

   ```ts
   import { ApiWrapperOptions } from 'openapi-typescript-wrapper-generator';
   import type { QueryKey, UseQueryOptions } from '@tanstack/react-query';
   import { useQuery, useQueryClient } from '@tanstack/react-query';
   import type { AxiosRequestConfig } from 'axios';

   export const myApiWrapper = <TVariables, TData>(
     req: (variables: TVariables, axiosConfig?: AxiosRequestConfig) => TData,
     options: ApiWrapperOptions,
   ) => {
     const queryKey: QueryKey = [
       options.filePath,
       options.groupName,
       options.endpointName,
     ];

     const useMyQuery = (
       reqVariables: TVariables,
       axiosConfig?: AxiosRequestConfig,
       queryOptions?: Omit<
         UseQueryOptions<TData, unknown, TData>,
         'queryKey' | 'queryFn'
       >,
     ) => {
       return useQuery({
         queryKey,
         queryFn: () => req(reqVariables, axiosConfig),
         ...queryOptions,
       });
     };

     const useInvalidateQuery = () => {
       const client = useQueryClient();
       return () => client.invalidateQueries([queryKey]);
     };

     return {
       queryKey,
       useQuery: useMyQuery,
       useInvalidateQuery,
     };
   };

   export type MyApiWrapper<
     TReq extends (variables: any) => any,
     TOptions extends ApiWrapperOptions,
   > = {
     queryVariables: Parameters<TReq>[0];
   };
   ```

1. Create file with configuration object

   ```ts
   import { Configuration } from './generated/todos/configuration';

   export const myApiConfiguration = new Configuration({
     basePath: 'http://localhost:4000',
   });
   ```

1. Run this command in a terminal (replace paths and export names according to your project structure)

   ```bash
   npx openapi-typescript-wrapper-generator generatedApi/todos \
     --wrapperPath myApiWrapper.ts \
     --wrapperExportName myApiWrapper \
     --wrapperTypePath myApiWrapper.ts \
     --wrapperTypeExportName MyApiWrapper \
     --configurationPath myApiConfiguration.ts \
     --configurationExportName myApiConfiguration \
     --outputPath generatedApi/todos/wrapper
   ```

1. Look at the file at `outputPath`. You will see something like this:

   ```ts
   import {TodosApi} from './api'
   import {myApiWrapper as wrapper} from '../myApiWrapper'
   import {MyApiWrapper as Wrapper} from '../myApiWrapper'
   import {configuration} from '../myApiConfiguration'

   const todosApi = new TodosApi(configuration)

   const filePath = 'src/generated/todos/wrapper.ts'

   export const todosEndpoints = {
     getTodos: wrapper(todosApi.getTodos, {filePath, groupName: 'Todos', endpointName: 'getTodos'}),
     addTodo: wrapper(todosApi.addTodo, {filePath, groupName: 'Todos', endpointName: 'addTodos'}),
   }
   export type todosEndpoints = {
     getTodos: Wrapper<typeof todosApi.getTodos, {filePath: typeof filePath, groupName: 'Todos', endpointName: 'getTodos'})>;
     addTodo: Wrapper<typeof todosApi.addTodo, {filePath: typeof filePath, groupName: 'Todos', endpointName: 'addTodos'}>;
   }
   ```

## CLI api

```
openapi-typescript-wrapper-generator [sourceDirectory] [options]

Source directory:
  Relative path to directory that container `api.ts` file generated by OpenAPI Generator

Options:
  --wrapperPath               Relative path to file that contains wrapper function
  --wrapperExportName         Optional, if wrapper function is exported as named export, provide the name under which it's exported
  --wrapperTypePath           Relative path to file that contains wrapper type
  --wrapperTypeExportName     Optional, if wrapper type is exported as named export, provide the name under which it's exported
  --configurationPath         Relative path to file that contains configuration object
  --configurationExportName   Optional, if configuration object is exported as named export, provide the name under which it's exported
  --outputPath                Relative path to file where generated code should be outputted
```

## JS api

```ts
import { generateWrappers } from './generateWrappers';

generateWrappers({
  // To find out what to send, look at the types
});
```

## Compatibility

It's tested with [OpenAPI Generator 6.6.0](https://openapi-generator.tech/) and [typescript-axios generator](https://openapi-generator.tech/docs/generators/typescript-axios)

But it should work with other versions and other typescript generators. If it doesn't please create issue.
