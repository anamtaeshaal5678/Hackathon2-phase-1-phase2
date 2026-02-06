/**
 * Verification script for Production Environment Variables
 * Run this script locally with a .env.production file or use it as a reference
 * to check your Vercel Project Settings.
 */

const requiredVars = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL"
];

const checkEnv = () => {
    console.log("=== Environment Variable Check ===\n");
    let allValid = true;

    requiredVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            let maskedValue = value.substring(0, 5) + "..." + value.substring(value.length - 3);
            if (varName === "DATABASE_URL") {
                // Check if it's postgres
                if (!value.startsWith("postgres://") && !value.startsWith("postgresql://")) {
                    console.error(`✗ ${varName}: Present but DOES NOT look like a PostgreSQL URL. (Value: ${maskedValue})`);
                    allValid = false;
                } else {
                    console.log(`✓ ${varName}: Present and looks like PostgreSQL.`);
                }
            } else {
                console.log(`✓ ${varName}: Present. (Value: ${maskedValue})`);
            }
        } else {
            console.error(`✗ ${varName}: MISSING!`);
            allValid = false;
        }
    });

    if (allValid) {
        console.log("\n✓ All core environment variables are present.");
        console.log("Your Vercel deployment should be able to handle authentication correctly.");
    } else {
        console.error("\n! Some environment variables are missing or incorrect.");
        console.error("Please add them to your Vercel Project Settings (Settings > Environment Variables).");
    }
};

checkEnv();
