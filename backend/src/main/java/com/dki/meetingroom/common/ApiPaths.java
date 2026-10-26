package com.dki.meetingroom.common;

public final class ApiPaths {
    public static final String API_V1 = "/api/v1";
    public static final String ROOMS = API_V1 + "/rooms";
    public static final String BOOKINGS = API_V1 + "/bookings";
    public static final String ROOM_SUBPATHS = ROOMS + "/**";
    public static final String SWAGGER_UI = "/swagger-ui.html";
    public static final String SWAGGER_ASSETS = "/swagger-ui/**";
    public static final String OPEN_API_DOCS_ROOT = "/v3/api-docs";
    public static final String OPEN_API_DOCS = "/v3/api-docs/**";
    public static final String OPEN_API_YAML = "/v3/api-docs.yaml";

    private ApiPaths() {
    }
}
