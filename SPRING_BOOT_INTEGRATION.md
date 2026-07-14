# Spring Boot integration

For the production application, the preferred result is usually:

- Swagger UI: `/swagger-ui/index.html`
- OpenAPI JSON: `/v3/api-docs`
- OpenAPI YAML: `/v3/api-docs.yaml`

## Maven dependency

Use the Springdoc dependency version approved by your project dependency-management policy:

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>${springdoc.version}</version>
</dependency>
```

## application.yml

```yaml
springdoc:
  api-docs:
    enabled: true
    path: /v3/api-docs
  swagger-ui:
    enabled: true
    path: /swagger-ui.html
    operations-sorter: method
    tags-sorter: alpha
    display-request-duration: true
    persist-authorization: false
```

## Important

This standalone package displays the supplied `openapi.yaml`. For the live Spring Boot service, either:

1. Generate the OpenAPI document from annotations and ensure it matches this contract, or
2. Serve this YAML as the canonical API definition and configure Swagger UI to load it.

`Try it out` requires a reachable backend server, correct `servers` URLs in OpenAPI, HTTPS in production, and CORS/security configuration that allows the Swagger UI origin.
