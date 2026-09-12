const User = require("./User");

describe("User medicalSystem validation", () => {
  const baseUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  it("does not require a medical system for patient accounts", () => {
    const user = new User({ ...baseUser, role: "patient" });

    expect(user.validateSync()).toBeUndefined();
  });

  it("requires a medical system for doctor accounts", () => {
    const user = new User({ ...baseUser, role: "doctor" });
    const error = user.validateSync();

    expect(error.errors.medicalSystem.message).toBe("Path `medicalSystem` is required.");
  });

  it("accepts a supported medical system for doctor accounts", () => {
    const user = new User({ ...baseUser, role: "doctor", medicalSystem: "allopathic" });

    expect(user.validateSync()).toBeUndefined();
  });
});
