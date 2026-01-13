router.get(
  "/",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const admin = await Admin.findById(req.user.id).select("-password");
      if (!admin) return res.status(404).json({ message: "Admin not found" });

      res.json({
        success: true,
        message: "Admin profile fetched",
        user: admin,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);
