import React, { useState } from 'react';
import { Input, type InputProps } from '../common/Input';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => setShowPassword(!showPassword);

    return (
      <div className="relative w-full">
        <Input
          type={showPassword ? 'text' : 'password'}
          ref={ref}
          className="pr-10"
          {...props}
        />
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center h-full"
        >
          {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
