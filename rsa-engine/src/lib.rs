//! Toy RSA math for the demo, exported as plain C-ABI functions so the page can
//! call them straight from JavaScript. Everything is u32 in, u32 out; u32::MAX
//! means "none / out of range" and the JS adapter turns it into null or RangeError.

use std::ptr::addr_of;

const NONE: u32 = u32::MAX;
const CYCLE_CAP: usize = 1024;

static mut CYCLE: [u32; CYCLE_CAP] = [0; CYCLE_CAP];

#[no_mangle]
pub extern "C" fn is_prime(n: u32) -> u32 {
    if n < 2 {
        return 0;
    }
    let n = n as u64;
    let mut i = 2u64;
    while i * i <= n {
        if n % i == 0 {
            return 0;
        }
        i += 1;
    }
    1
}

#[no_mangle]
pub extern "C" fn gcd(mut a: u32, mut b: u32) -> u32 {
    while b != 0 {
        let t = a % b;
        a = b;
        b = t;
    }
    a
}

#[no_mangle]
pub extern "C" fn phi(p: u32, q: u32) -> u32 {
    if p == q || is_prime(p) == 0 || is_prime(q) == 0 {
        return NONE;
    }
    let product = (p as u64 - 1) * (q as u64 - 1);
    if product >= NONE as u64 {
        NONE
    } else {
        product as u32
    }
}

#[no_mangle]
pub extern "C" fn smallest_factor(n: u32) -> u32 {
    let wide = n as u64;
    let mut i = 2u64;
    while i * i <= wide {
        if wide % i == 0 {
            return i as u32;
        }
        i += 1;
    }
    n
}

#[no_mangle]
pub extern "C" fn mod_pow(base: u32, exp: u32, modulus: u32) -> u32 {
    if modulus == 0 {
        return NONE;
    }
    let m = modulus as u64;
    let mut result = 1u64 % m;
    let mut b = base as u64 % m;
    let mut e = exp;
    while e > 0 {
        if e & 1 == 1 {
            result = result * b % m;
        }
        b = b * b % m;
        e >>= 1;
    }
    result as u32
}

#[no_mangle]
pub extern "C" fn mod_inverse(a: u32, modulus: u32) -> u32 {
    if modulus == 0 {
        return NONE;
    }
    let m = modulus as i64;
    let (mut old_r, mut r) = (a as i64 % m, m);
    let (mut old_s, mut s) = (1i64, 0i64);
    while r != 0 {
        let q = old_r / r;
        (old_r, r) = (r, old_r - q * r);
        (old_s, s) = (s, old_s - q * s);
    }
    if old_r != 1 {
        return NONE;
    }
    (((old_s % m) + m) % m) as u32
}

#[no_mangle]
pub extern "C" fn encrypt(m: u32, e: u32, n: u32) -> u32 {
    if m >= n {
        return NONE;
    }
    mod_pow(m, e, n)
}

#[no_mangle]
pub extern "C" fn decrypt(c: u32, d: u32, n: u32) -> u32 {
    if c >= n {
        return NONE;
    }
    mod_pow(c, d, n)
}

/// Writes [1, base, base^2, ...] mod modulus into a static buffer, stopping when
/// the sequence returns to 1, and returns how many values were written.
#[no_mangle]
pub extern "C" fn power_cycle(base: u32, modulus: u32) -> u32 {
    if modulus == 0 {
        return 0;
    }
    let m = modulus as u64;
    let one = 1 % m;
    let mut len = 0usize;
    let mut value = one;
    // SAFETY: the module is single-threaded; JS reads the buffer only after this returns.
    unsafe {
        let buf = &mut *std::ptr::addr_of_mut!(CYCLE);
        loop {
            buf[len] = value as u32;
            len += 1;
            value = value * (base as u64 % m) % m;
            if value == one || len == CYCLE_CAP {
                break;
            }
        }
    }
    len as u32
}

#[no_mangle]
pub extern "C" fn cycle_ptr() -> *const u32 {
    addr_of!(CYCLE) as *const u32
}
