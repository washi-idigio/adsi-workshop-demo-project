package com.example.attendance.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MemoUpdateRequest(
    String type,
    @NotBlank @Size(max = 200) String memo
) {
}
