/* @ds-bundle: {"format":4,"namespace":"JAKBRAINPlumCreamDesignSystem_5dd070","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"ProgressBar","sourcePath":"components/feedback/ProgressBar.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"d867ed422233","components/core/Button.jsx":"f8992243227b","components/core/Card.jsx":"10c9e6f11a1b","components/core/Eyebrow.jsx":"ad9ad1cb0cdf","components/feedback/ProgressBar.jsx":"865aa0d4047f","components/forms/Input.jsx":"3f546d520657"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.JAKBRAINPlumCreamDesignSystem_5dd070 = window.JAKBRAINPlumCreamDesignSystem_5dd070 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function Badge({
  variant = 'outline',
  children,
  style
}) {
  const v = variant === 'solid' ? {
    background: 'var(--action-bg)',
    color: 'var(--action-fg)',
    border: '1px solid transparent'
  } : {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--line)'
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      padding: '4px 10px',
      borderRadius: 'var(--radius-xs)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      whiteSpace: 'nowrap',
      ...v,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const pad = size === 'sm' ? '10px 18px' : size === 'lg' ? '16px 28px' : '14px 24px';
  const fs = size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)';
  const v = {
    primary: {
      background: hover ? 'var(--action-bg-hover)' : 'var(--action-bg)',
      color: 'var(--action-fg)',
      border: '1px solid transparent'
    },
    secondary: {
      background: hover ? 'var(--line-subtle)' : 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--line-strong)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid transparent',
      textDecoration: hover ? 'underline' : 'none',
      textDecorationColor: 'var(--line-strong)',
      textUnderlineOffset: '4px'
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: fs,
      fontWeight: 600,
      padding: pad,
      borderRadius: 'var(--radius-full)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      transition: 'background var(--duration-fast) var(--ease-standard)',
      ...v,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  children,
  padding = 28,
  interactive = false,
  style
}) {
  const [hover, setHover] = React.useState(false);
  const lift = interactive && hover;
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--surface-raised)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      padding,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxShadow: lift ? 'var(--shadow-lg)' : 'var(--shadow-md)',
      transform: lift ? 'translateY(-2px)' : 'none',
      transition: 'all var(--duration-normal) var(--ease-standard)',
      cursor: interactive ? 'pointer' : 'default',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Eyebrow.jsx
try { (() => {
function Eyebrow({
  children,
  rule = true,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      ...style
    }
  }, rule && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 1,
      background: 'var(--line-strong)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      letterSpacing: 'var(--tracking-widest)',
      textTransform: 'uppercase',
      color: 'var(--text-emphasis)'
    }
  }, children));
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressBar.jsx
try { (() => {
function ProgressBar({
  value = 0,
  label,
  showValue = true,
  style
}) {
  const v = Math.max(0, Math.min(100, value));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      ...style
    }
  }, (label || showValue) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-heading)',
      fontSize: 13,
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", null, label), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      color: 'var(--text-primary)'
    }
  }, v, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      background: 'var(--track)',
      borderRadius: 'var(--radius-full)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: v + '%',
      height: '100%',
      background: 'var(--fill)',
      borderRadius: 'var(--radius-full)',
      transition: 'width var(--duration-slow) var(--ease-decelerate)'
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  hint,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--text-base)',
      padding: '12px 14px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-sunken)',
      color: 'var(--text-primary)',
      border: '1px solid ' + (focus ? 'var(--line-strong)' : 'var(--line-subtle)'),
      outline: 'none',
      boxShadow: focus ? '0 0 0 3px var(--line-subtle)' : 'none',
      transition: 'all var(--duration-fast) var(--ease-standard)'
    }
  }, rest)), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Input = __ds_scope.Input;

})();
