# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.4] - 2020-07-22
### Fixed
- `useFetch` useEffect return bug

## [0.2.3] - 2020-07-22
### Fixed
- `useFetch` export

## [0.2.2] - 2020-07-14
### Changed
- `ReduxActionConstants` - `toReadonlyObject` method

## [0.2.1] - 2020-07-14
### Changed
- `ReduxActionConstants` - `toObject` method

## [0.2.0] - 2020-07-12
### Added
- `buildClient` - onResponseFulfilled, onRequestFulfilled, onRequestRejected callbacks in options
- `BulidClientWithCanceler` - constructor, similar to buildClient, but with request canceling builtin capability 
- `useFetch` - addition of options, onCancelMsg (`string`) & onCancel (`callback`)

### Changed
- `buildClient` - onResponseError to onResponseRejected
- `useFetch` - internally handles request cancellation if dependency changes (or) component unmounts before api hit is completed

### removed
- `buildClient` - getToken option

## [0.1.0] - 2020-07-6
### Added
- tests for all the components and hooks, etc.
- `useFetch` - transformResData, defaultData, defaultFetched options addition

### Changed
- `BreadCrumb` - css improvements
- `buildClient` - changed the entire implementation

## [0.0.2] - 2020-06-30
### Fixed
- `Routes` - with crumbs, "exact" not working
- `createBreadcrumb` - active / inactive interchange

## [0.0.1] - 2020-06-30
### Added
- `Service` - buildClient
- `Core` - Routes, LetSuspence
- `Hooks` - useCountRenders, useFetch
- `Factories` - ReduxActionConstants
- `Component Creators` - createFormError, createBreadcrumb