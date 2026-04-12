export const pageReveal = {
  hidden: {
    opacity: 0,
    y: 28
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08
    }
  }
};

export const staggerFast = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.03
    }
  }
};

export const riseIn = {
  hidden: {
    opacity: 0,
    y: 24
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.62,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const delayedRise = (delay = 0) => ({
  hidden: {
    opacity: 0,
    y: 24
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.62,
      delay,
      ease: [0.22, 1, 0.36, 1]
    }
  }
});

export const panelReveal = {
  hidden: {
    opacity: 0,
    x: 32
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.68,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const fieldReveal = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.98
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const otpReveal = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 12
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const hoverLift = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 18px 50px rgba(8, 15, 34, 0.2)"
  },
  hover: {
    scale: 1.05,
    y: -6,
    boxShadow: "0 0 0 1px rgba(56, 189, 248, 0.2), 0 22px 60px rgba(52, 211, 153, 0.2)",
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 20
    }
  }
};

export const pulseGlow = {
  rest: {
    boxShadow: [
      "0 0 0 rgba(56, 189, 248, 0.18), 0 12px 30px rgba(56, 189, 248, 0.14)",
      "0 0 18px rgba(52, 211, 153, 0.2), 0 16px 36px rgba(56, 189, 248, 0.18)",
      "0 0 0 rgba(56, 189, 248, 0.18), 0 12px 30px rgba(56, 189, 248, 0.14)"
    ],
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const chartBar = {
  hidden: {
    opacity: 0,
    scaleY: 0.4,
    y: 16
  },
  visible: {
    opacity: 1,
    scaleY: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};
