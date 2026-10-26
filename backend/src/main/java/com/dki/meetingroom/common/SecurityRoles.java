package com.dki.meetingroom.common;

public final class SecurityRoles {
    public static final String ADMIN = "ADMIN";
    public static final String EMPLOYEE = "EMPLOYEE";

    public static final String AUTHORITY_PREFIX = "ROLE_";
    public static final String ADMIN_AUTHORITY = AUTHORITY_PREFIX + ADMIN;
    public static final String EMPLOYEE_AUTHORITY = AUTHORITY_PREFIX + EMPLOYEE;

    private SecurityRoles() {
    }
}
