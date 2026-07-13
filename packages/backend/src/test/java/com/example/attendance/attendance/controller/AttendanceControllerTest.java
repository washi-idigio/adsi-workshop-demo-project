package com.example.attendance.attendance.controller;

import com.example.attendance.attendance.domain.AttendanceStatus;
import com.example.attendance.attendance.dto.AttendanceHistoryResponse;
import com.example.attendance.attendance.dto.AttendanceRecordResponse;
import com.example.attendance.attendance.dto.DailyAttendanceResponse;
import com.example.attendance.attendance.dto.MonthlySummaryResponse;
import com.example.attendance.attendance.dto.TodayStatusResponse;
import com.example.attendance.attendance.service.AttendanceService;
import com.example.attendance.common.config.CorsConfig;
import com.example.attendance.common.config.SecurityConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
    controllers = AttendanceController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {SecurityConfig.class, CorsConfig.class}
    )
)
@Import(AttendanceControllerTest.TestSecurityConfig.class)
@ActiveProfiles("test")
class AttendanceControllerTest {

    @org.springframework.boot.test.context.TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
            http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AttendanceService attendanceService;

    private static final UUID EMPLOYEE_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Test
    @DisplayName("POST /api/attendance/clock-in は201を返す")
    void clockIn_validRequest_returns201() throws Exception {
        // Arrange
        var response = new AttendanceRecordResponse(
                UUID.randomUUID(),
                LocalDate.of(2025, 1, 15),
                Instant.parse("2025-01-15T00:00:00Z"),
                null,
                false
        );
        when(attendanceService.clockIn(EMPLOYEE_ID)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/attendance/clock-in")
                        .param("employeeId", EMPLOYEE_ID.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.workDate").value("2025-01-15"))
                .andExpect(jsonPath("$.clockOut").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/attendance/clock-out は200を返す")
    void clockOut_validRequest_returns200() throws Exception {
        // Arrange
        var response = new AttendanceRecordResponse(
                UUID.randomUUID(),
                LocalDate.of(2025, 1, 15),
                Instant.parse("2025-01-14T23:00:00Z"),
                Instant.parse("2025-01-15T08:00:00Z"),
                false
        );
        when(attendanceService.clockOut(EMPLOYEE_ID)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/attendance/clock-out")
                        .param("employeeId", EMPLOYEE_ID.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clockOut").exists());
    }

    @Test
    @DisplayName("GET /api/attendance/today は200を返す")
    void getTodayStatus_validRequest_returns200() throws Exception {
        // Arrange
        var response = new TodayStatusResponse(AttendanceStatus.NOT_CLOCKED_IN, List.of());
        when(attendanceService.getTodayStatus(EMPLOYEE_ID)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/api/attendance/today")
                        .param("employeeId", EMPLOYEE_ID.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("NOT_CLOCKED_IN"))
                .andExpect(jsonPath("$.records").isArray());
    }

    @Test
    @DisplayName("POST /api/attendance/clock-in メモ付きリクエストで201を返す")
    void clockIn_withMemo_returns201WithMemo() throws Exception {
        // Arrange
        var response = new AttendanceRecordResponse(
                UUID.randomUUID(),
                LocalDate.of(2025, 1, 15),
                Instant.parse("2025-01-15T00:00:00Z"),
                null,
                false,
                "電車遅延",
                null
        );
        when(attendanceService.clockIn(eq(EMPLOYEE_ID), eq("電車遅延"))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/attendance/clock-in")
                        .param("employeeId", EMPLOYEE_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"memo\":\"電車遅延\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.clockInMemo").value("電車遅延"));
    }

    @Test
    @DisplayName("POST /api/attendance/clock-out メモ付きリクエストで200を返す")
    void clockOut_withMemo_returns200WithMemo() throws Exception {
        // Arrange
        var response = new AttendanceRecordResponse(
                UUID.randomUUID(),
                LocalDate.of(2025, 1, 15),
                Instant.parse("2025-01-14T23:00:00Z"),
                Instant.parse("2025-01-15T08:00:00Z"),
                false,
                null,
                "体調不良"
        );
        when(attendanceService.clockOut(eq(EMPLOYEE_ID), eq("体調不良"))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/attendance/clock-out")
                        .param("employeeId", EMPLOYEE_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"memo\":\"体調不良\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clockOutMemo").value("体調不良"));
    }

    @Test
    @DisplayName("PUT /api/attendance/{id}/memo でメモを編集できる")
    void updateMemo_validRequest_returns200() throws Exception {
        // Arrange
        var recordId = UUID.randomUUID();
        var response = new AttendanceRecordResponse(
                recordId,
                LocalDate.of(2025, 1, 15),
                Instant.parse("2025-01-15T00:00:00Z"),
                null,
                false,
                "体調不良",
                null
        );
        when(attendanceService.updateMemo(eq(recordId), eq(EMPLOYEE_ID), eq("clockIn"), eq("体調不良")))
                .thenReturn(response);

        // Act & Assert
        mockMvc.perform(put("/api/attendance/{id}/memo", recordId)
                        .param("employeeId", EMPLOYEE_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"clockIn\",\"memo\":\"体調不良\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clockInMemo").value("体調不良"));
    }

    @Test
    @DisplayName("DELETE /api/attendance/{id}/memo/{type} でメモを削除できる")
    void deleteMemo_validRequest_returns204() throws Exception {
        // Arrange
        var recordId = UUID.randomUUID();

        // Act & Assert
        mockMvc.perform(delete("/api/attendance/{id}/memo/{type}", recordId, "clockIn")
                        .param("employeeId", EMPLOYEE_ID.toString()))
                .andExpect(status().isNoContent());

        verify(attendanceService).deleteMemo(recordId, EMPLOYEE_ID, "clockIn");
    }

    @Test
    @DisplayName("POST /api/attendance/clock-in メモが200文字超の場合400エラー")
    void clockIn_memoTooLong_returns400() throws Exception {
        // Arrange
        var longMemo = "あ".repeat(201);

        // Act & Assert
        mockMvc.perform(post("/api/attendance/clock-in")
                        .param("employeeId", EMPLOYEE_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"memo\":\"" + longMemo + "\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/attendance/history は200を返す")
    void getHistory_validRequest_returns200() throws Exception {
        // Arrange
        var dailyResponse = new DailyAttendanceResponse(
                LocalDate.of(2025, 1, 15),
                List.of(),
                540,
                60,
                480,
                0
        );
        var summary = new MonthlySummaryResponse(1, 480, 0, 22);
        var response = new AttendanceHistoryResponse("2025-01", List.of(dailyResponse), summary);
        when(attendanceService.getHistory(EMPLOYEE_ID, "2025-01")).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/api/attendance/history")
                        .param("employeeId", EMPLOYEE_ID.toString())
                        .param("month", "2025-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.month").value("2025-01"))
                .andExpect(jsonPath("$.days").isArray())
                .andExpect(jsonPath("$.summary.workDays").value(1));
    }
}
